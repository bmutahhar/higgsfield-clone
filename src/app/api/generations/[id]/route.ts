import { readJob } from "@/server/generation-jobs.server";

/*
 * One job's status. Polled, so it must never be cached — a cached `pending`
 * would leave the tile spinning forever.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const status = readJob(id);

  if (!status) {
    return Response.json({ error: "Unknown generation" }, { status: 404 });
  }

  return Response.json(status, {
    headers: { "cache-control": "no-store" },
  });
}
