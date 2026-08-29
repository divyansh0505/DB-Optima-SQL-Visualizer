import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

const LOCAL_DATA_FILE = path.join(process.cwd(), ".data", "saved_queries.json");

async function getLocally(id: string) {
  try {
    const raw = await fs.readFile(LOCAL_DATA_FILE, "utf-8");
    const data = JSON.parse(raw);
    return data[id] ?? null;
  } catch {
    return null;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (process.env.DATABASE_URL) {
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
    } else {
      // Local file fallback
      const query = await getLocally(params.id);
      if (!query) {
        return NextResponse.json(
          { error: "Not found", message: "Query not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(query);
    }
  } catch (err) {
    console.error("[/api/queries/[id] GET]", err);
    return NextResponse.json(
      { error: "Failed to fetch query", message: (err as Error).message },
      { status: 500 }
    );
  }
}