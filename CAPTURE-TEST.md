# CAPTURE-TEST

Proof that automatic prompt/response capture is installed and fires in sessions that
did not create it.

## Tool and model

- **Tool:** Claude Code `2.1.270`, running inside the Claude desktop app (Code tab) on
  macOS. The same binary at `/Users/mutahharbm/.local/bin/claude` is used for the
  headless canary runs.
- **Model:** `claude-opus-5` for both planning and execution. There is no separate
  planner/executor split — one model does both, and every log entry carries the model
  name so any mid-build switch is visible.
- **Automatic mechanism:** yes. Claude Code has a hooks system configured in
  `.claude/settings.json`. I did not take this on trust — I confirmed the available
  hook events against this exact binary:

  ```
  strings -n 8 ~/.local/share/claude/versions/2.1.270 \
    | grep -oE '\b(UserPromptSubmit|Stop|SessionStart|PreToolUse|PostToolUse|SubagentStop)\b' \
    | sort | uniq -c
  ```

  which returned `Stop` (293), `PreToolUse` (207), `PostToolUse` (140),
  `SessionStart` (72), `UserPromptSubmit` (64), `SubagentStop` (56), plus
  `Notification`, `PreCompact`, `SessionEnd`, `PostCompact`. The same grep confirmed
  the stdin payload fields `session_id`, `transcript_path`, `prompt`,
  `hook_event_name` and the `CLAUDE_PROJECT_DIR` variable.

## Mechanism and files changed

| File                       | Role                                                                                                                                                                    |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.claude/settings.json`    | Wires `UserPromptSubmit` → `capture.py prompt` and `Stop` → `capture.py response`. Committed to the repo, so it applies to **every** session started in this directory. |
| `.claude/hooks/capture.py` | The capture script. Appends to `.agent-logs/<file>.md`.                                                                                                                 |
| `.agent-logs/`             | Output. Committed. Explicitly **not** in `.gitignore`.                                                                                                                  |

How it works:

- `UserPromptSubmit` receives the prompt on stdin and writes it **verbatim** — no
  truncation, no cleanup.
- `Stop` receives `transcript_path` and walks the session transcript backwards from the
  end, collecting assistant `text` blocks and stopping at the first `user` record. That
  yields exactly the final response of the turn: no thinking blocks, no tool calls, no
  intermediate assistant text that preceded a tool call, no subagent sidechains.
- Frontmatter (`total_exchanges`, `first_prompt_time`, `last_prompt_time`) is
  recomputed on each append. Entries themselves are append-only and never edited.
- The hook never blocks a turn: every failure path exits 0 and appends to
  `.agent-logs/.capture-errors.log`, so a broken hook is visible rather than silent.

## Where the canaries landed

- `.agent-logs/2026-09-13_11-22-47_bb9f594c-0f0a-4532-8541-13d5a89497df.md` (canary 1)
- `.agent-logs/2026-09-13_11-23-21_dbfbb9a3-a585-4f85-ac27-2c27f31979c8.md` (canary 2)

Two independent sessions, each started fresh with the hook already installed by an
earlier session. Neither created the hook.

### Canary 1 — raw, session `bb9f594c`

```
[LOG_ENTRY type=PROMPT num=1 session=bb9f594c]
timestamp: 2026-09-13T11:22:47.952Z
model: claude-opus-5

CAPTURE TEST — 8x assignment, Mutahhar BM


[LOG_ENTRY type=RESPONSE num=1 session=bb9f594c]
timestamp: 2026-09-13T11:22:48.025Z
model: claude-opus-5

(no final text response for this turn)
```

That `(no final text response for this turn)` is a **real bug this canary caught**, left
in the log deliberately. See below.

### Canary 2 — raw, session `dbfbb9a3` (after the fix)

```
[LOG_ENTRY type=PROMPT num=1 session=dbfbb9a3]
timestamp: 2026-09-13T11:23:21.586Z
model: claude-opus-5

CAPTURE TEST — 8x assignment, Mutahhar BM (second session)


[LOG_ENTRY type=RESPONSE num=1 session=dbfbb9a3]
timestamp: 2026-09-13T11:23:21.860Z
model: claude-opus-5

CAPTURE TEST ACK — this response was produced by a local stub API, not by a model. It exists to prove the Stop hook fires and writes a RESPONSE entry in a session that did not create the hook.
```

A third turn was then run with `--resume` against `dbfbb9a3` to confirm multi-turn
behaviour: the file now shows `total_exchanges: 2` with `PROMPT num=2` / `RESPONSE
num=2` appended and `last_prompt_time` advanced.

## Honest note on the canary responses

The canary **responses** above came from a local stub Anthropic API, not from a real
model, and the text says so. This is why:

The headless CLI could not authenticate — `OAuth session expired and could not be
refreshed`, with `expiresAt: 0` in the keychain entry. I did not run a login flow
(that is the user's credential to enter, not mine). To still prove the `Stop` hook
fires end-to-end in a fresh session, I pointed the CLI at a local
`/v1/messages`-compatible stub (`ANTHROPIC_BASE_URL=http://127.0.0.1:8823`) that
returns one canned text block.

What that does and does not prove:

- **Proves:** the hook is installed at project level, fires in a fresh session, reads
  the transcript, extracts the final response, and appends a correctly formatted
  RESPONSE entry. The path from Claude Code's `Stop` event to the log file is real.
- **Does not prove:** anything about model output, because the model was stubbed. The
  prompt side was never stubbed — those are real `UserPromptSubmit` events.

Real end-to-end capture with a live model is visible in this repo's other
`.agent-logs/` session files, which are produced by the desktop app sessions doing the
actual assignment work.

## What I tried first that did not work

1. **`claude -p` with normal auth.** Failed: `OAuth session expired and could not be
refreshed`. Notably, the `UserPromptSubmit` hook _still fired_ before the auth
   failure and wrote
   `.agent-logs/2026-09-13_11-21-20_b66ca7c5-dd35-4d5d-bae0-27379d9237a2.md` with a
   PROMPT entry and no RESPONSE. That orphan file is left in the repo — it is the
   cleanest single piece of evidence that the hook fires in a session it did not
   create.
2. **Spawning a second desktop session programmatically.** No `start_session` tool is
   exposed to this session. `send_message` only reaches existing sessions, and every
   other live session was in an unrelated repo, so firing hooks there would have proved
   nothing and disturbed unrelated work.
3. **First version of the `Stop` extraction had a flush race.** The hook ran ~50ms after
   the assistant record was created but before it was flushed to the transcript on
   disk, so it logged `(no final text response for this turn)` — canary 1 above. Fixed
   by re-reading the transcript for up to 3s while extraction is empty.
4. **First version of the duplicate guard was too aggressive.** It skipped any RESPONSE
   whose text already appeared after the last RESPONSE marker, which would have silently
   dropped a genuine turn where the model answered with identical text twice. Narrowed
   to: skip only when the very last entry in the file is already that same RESPONSE.
   Verified with the `--resume` turn, where the stub returned a byte-identical reply and
   it was correctly logged as a second exchange.
5. **A shell-quoting failure in my own first dry run**, where `echo` expanded `\n`
   inside the JSON payload and the script recorded a `JSONDecodeError` to
   `.capture-errors.log`. That was a bug in the test, not the hook — but it did confirm
   the error path works and never blocks the session.

## Known limitation

The `model:` field on a PROMPT entry is resolved from the most recent assistant record
in the transcript, because the model for the _upcoming_ response is not known at
prompt-submit time. On the very first prompt of a session it falls back to the most
recently used model in this project, and to `unknown` if there is none. RESPONSE
entries always carry the model that actually produced the text.
