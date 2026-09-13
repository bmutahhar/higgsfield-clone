#!/usr/bin/env python3
"""
Automatic prompt/response capture for Claude Code.

Wired in .claude/settings.json:
  UserPromptSubmit -> capture.py prompt    (logs the verbatim user prompt)
  Stop             -> capture.py response  (logs the final assistant text of that turn)

Writes one markdown file per session into .agent-logs/.
Captures ONLY the prompt and the final response. No thinking, no tool calls,
no intermediate assistant text that preceded a tool call.

Never blocks the session: every failure path exits 0 and leaves a note in
.agent-logs/.capture-errors.log so a broken hook is visible but not fatal.
"""

import fcntl
import json
import os
import re
import sys
import time
import traceback
from datetime import datetime, timezone
from pathlib import Path

TOOL = "claude-code"
AUTHOR = os.environ.get("AGENT_LOG_AUTHOR", "bmutahhar")

ENTRY_RE = re.compile(r"^\[LOG_ENTRY type=(PROMPT|RESPONSE) num=(\d+) session=", re.M)


def project_dir() -> Path:
    p = os.environ.get("CLAUDE_PROJECT_DIR")
    if p:
        return Path(p)
    return Path(__file__).resolve().parent.parent.parent


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.") + \
        f"{datetime.now(timezone.utc).microsecond // 1000:03d}Z"


def log_error(root: Path, msg: str) -> None:
    try:
        d = root / ".agent-logs"
        d.mkdir(parents=True, exist_ok=True)
        with (d / ".capture-errors.log").open("a") as f:
            f.write(f"{now_iso()} {msg}\n")
    except Exception:
        pass


def read_transcript(path: str):
    """Parse the session transcript JSONL, dropping subagent (sidechain) records."""
    records = []
    if not path:
        return records
    try:
        with open(path, "r", errors="replace") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    rec = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if rec.get("isSidechain"):
                    continue
                records.append(rec)
    except OSError:
        pass
    return records


def latest_model(records) -> str:
    for rec in reversed(records):
        if rec.get("type") == "assistant":
            m = (rec.get("message") or {}).get("model")
            if m:
                return m
    return ""


def fallback_model(root: Path) -> str:
    """First turn of a session has no assistant record yet; look at the most
    recently touched transcript for this project instead of guessing."""
    try:
        slug = "-" + str(root.resolve()).lstrip("/").replace("/", "-")
        d = Path.home() / ".claude" / "projects" / slug
        files = sorted(d.glob("*.jsonl"), key=lambda p: p.stat().st_mtime, reverse=True)
        for f in files[:5]:
            m = latest_model(read_transcript(str(f)))
            if m:
                return m
    except Exception:
        pass
    return "unknown"


def final_response_text(records) -> str:
    """The final assistant text of the turn: walk back from the end collecting
    assistant text blocks, stopping at the first user record (a real prompt or a
    tool_result). Anything before the last tool call is an intermediate step and
    is deliberately dropped."""
    chunks = []
    for rec in reversed(records):
        t = rec.get("type")
        if t == "user":
            break
        if t != "assistant":
            continue
        content = (rec.get("message") or {}).get("content")
        if isinstance(content, str):
            chunks.append(content)
        elif isinstance(content, list):
            parts = [b.get("text", "") for b in content
                     if isinstance(b, dict) and b.get("type") == "text"]
            joined = "\n".join(p for p in parts if p.strip())
            if joined.strip():
                chunks.append(joined)
    chunks.reverse()
    return "\n\n".join(c.strip() for c in chunks if c.strip()).strip()


def session_file(root: Path, session_id: str, first_ts: str) -> Path:
    d = root / ".agent-logs"
    d.mkdir(parents=True, exist_ok=True)
    existing = list(d.glob(f"*_{session_id}.md"))
    if existing:
        return existing[0]
    stamp = first_ts.replace("-", "").replace(":", "")
    try:
        dt = datetime.strptime(first_ts[:19], "%Y-%m-%dT%H:%M:%S")
        stamp = dt.strftime("%Y-%m-%d_%H-%M-%S")
    except ValueError:
        stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d_%H-%M-%S")
    return d / f"{stamp}_{session_id}.md"


def split_head_body(text: str):
    idx = text.find("[LOG_ENTRY ")
    if idx == -1:
        return text, ""
    return text[:idx], text[idx:]


def build_head(session_id: str, project: str, model: str, body: str, date: str) -> str:
    prompts = [m for m in ENTRY_RE.finditer(body) if m.group(1) == "PROMPT"]
    times = re.findall(r"^timestamp: (\S+)$", body, re.M)
    stamps = []
    for m in ENTRY_RE.finditer(body):
        tail = body[m.end():m.end() + 200]
        ts = re.search(r"timestamp: (\S+)", tail)
        if m.group(1) == "PROMPT" and ts:
            stamps.append(ts.group(1))
    first_t = stamps[0] if stamps else (times[0] if times else "")
    last_t = stamps[-1] if stamps else (times[-1] if times else "")
    short = session_id[:8]
    return (
        "---\n"
        f"session_id: {session_id}\n"
        f"date: {date}\n"
        f"author: {AUTHOR}\n"
        f"model: {model}\n"
        f"tool: {TOOL}\n"
        f"project: {project}\n"
        f"total_exchanges: {len(prompts)}\n"
        f"first_prompt_time: {first_t}\n"
        f"last_prompt_time: {last_t}\n"
        "---\n\n"
        f"# Session Log - {date}\n\n"
        f"Session: `{short}` | Project: `{project}` | Author: `{AUTHOR}`\n\n"
        "---\n\n"
    )


def append_entry(root: Path, session_id: str, kind: str, model: str, text: str) -> Path:
    ts = now_iso()
    path = session_file(root, session_id, ts)
    project = root.name
    short = session_id[:8]

    with open(path, "a+") as f:
        fcntl.flock(f.fileno(), fcntl.LOCK_EX)
        f.seek(0)
        current = f.read()
        head, body = split_head_body(current)

        if kind == "RESPONSE":
            # Stop can fire more than once for one turn. Skip only when the very
            # last entry in the file is already this same RESPONSE — if a PROMPT
            # came after it, this is a new turn and must be logged even if the
            # model happened to answer with the exact same text.
            marks = list(ENTRY_RE.finditer(body))
            if marks and marks[-1].group(1) == "RESPONSE":
                last = body[marks[-1].end():]
                if text and text.strip() in last:
                    return path
            nums = [int(m.group(2)) for m in ENTRY_RE.finditer(body) if m.group(1) == "PROMPT"]
            num = nums[-1] if nums else 1
        else:
            nums = [int(m.group(2)) for m in ENTRY_RE.finditer(body) if m.group(1) == "PROMPT"]
            num = (nums[-1] + 1) if nums else 1

        entry = (
            f"[LOG_ENTRY type={kind} num={num} session={short}]\n"
            f"timestamp: {ts}\n"
            f"model: {model}\n\n"
            f"{text}\n\n\n"
        )
        body = body + entry
        date = ts[:10]
        head = build_head(session_id, project, model, body, date)

        f.seek(0)
        f.truncate()
        f.write(head + body)
    return path


def main() -> int:
    root = project_dir()
    try:
        kind = (sys.argv[1] if len(sys.argv) > 1 else "").lower()
        raw = sys.stdin.read()
        payload = json.loads(raw) if raw.strip() else {}
        session_id = payload.get("session_id") or "unknown-session"
        transcript = payload.get("transcript_path") or ""
        records = read_transcript(transcript)

        if kind == "prompt":
            text = payload.get("prompt", "")
            if not text.strip():
                return 0
            model = latest_model(records) or fallback_model(root)
            append_entry(root, session_id, "PROMPT", model, text)
        elif kind == "response":
            # The Stop hook can fire before the last assistant record has been
            # flushed to the transcript on disk. Re-read briefly before giving up.
            text = final_response_text(records)
            deadline = time.time() + 3.0
            while not text.strip() and time.time() < deadline:
                time.sleep(0.2)
                records = read_transcript(transcript)
                text = final_response_text(records)
            model = latest_model(records) or fallback_model(root)
            if not text.strip():
                text = "(no final text response for this turn)"
            append_entry(root, session_id, "RESPONSE", model, text)
        else:
            log_error(root, f"unknown mode: {kind!r}")
    except Exception:
        log_error(root, "capture failed: " + traceback.format_exc().replace("\n", " | "))
    return 0


if __name__ == "__main__":
    sys.exit(main())
