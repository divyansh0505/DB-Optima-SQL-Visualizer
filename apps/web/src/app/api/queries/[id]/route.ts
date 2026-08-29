import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          error: "Saving is not configured",
          message:
            "Set DATABASE_URL (see docker/docker-compose.yml) to enable saved/shareable queries.",
        },
        { status: 501 }
      );
    }

    const { db } = await import("@db-optima/database");
    const { savedQueries } = await import("@db-optima/database/schema");

    const [query] = await db
      .select()
      .from(savedQueries)
      .where(eq(savedQueries.id, params.id))
      .limit(1);

    if (!query) {
      return NextResponse.json(
        { error: "Not found", message: "Query not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(query);
  } catch (err) {
    console.error("[/api/queries/[id] GET]", err);
    return NextResponse.json(
      { error: "Failed to fetch query", message: (err as Error).message },
      { status: 500 }
    );
  }
}