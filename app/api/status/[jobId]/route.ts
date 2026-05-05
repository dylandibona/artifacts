import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  try {
    const result = await sql`
      SELECT status, result_url, error_msg FROM jobs WHERE id = ${jobId}
    `;

    if (!result.rows.length) {
      return NextResponse.json({ status: "not_found" }, { status: 404 });
    }

    const job = result.rows[0];
    return NextResponse.json({
      status: job.status,
      url: job.result_url ?? undefined,
      error: job.error_msg ?? undefined,
    });
  } catch {
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
