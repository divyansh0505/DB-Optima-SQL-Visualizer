import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { SaveQueryRequestSchema } from "@/lib/utils/validators";

export const runtime = "nodejs";

const LOCAL_DATA_FILE = path.join(process.cwd(), ".data", "saved_queries.json");

async function saveLocally(entry: { id: string; name: string; sql: string; schemaJson: any }) {
  await fs.mkdir(path.dirname(LOCAL_DATA_FILE), { recursive: true });
  let data: Record<string, any> = {};
  try {
    const raw = await fs.readFile(LOCAL_DATA_FILE, "utf-8");
    data = JSON.parse(raw);
  } catch {
    data = {};
  }
  data[entry.id] = { ...entry, createdAt: new Date().toISOString() };
  await fs.writeFile(LOCAL_DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function generateSavedQueryId(): string {
  return randomBytes(12).toString("base64url");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SaveQueryRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, sql, schemaJson } = parsed.data;
    const id = generateSavedQueryId();

    if (process.env.DATABASE_URL) {
      const { db } = await import("@db-optima/database");
      const { savedQueries } = await import("@db-optima/database/schema");
      await db.insert(savedQueries).values({ id, name, sql, schemaJson });
    } else {
      // Local file storage fallback when DATABASE_URL is not set
      await saveLocally({ id, name, sql, schemaJson });
    }

    return NextResponse.json({ id });
  } catch (err) {
    console.error("[/api/queries POST]", err);
    return NextResponse.json(
      { error: "Save failed", message: (err as Error).message },
      { status: 500 }
    );
  }
}