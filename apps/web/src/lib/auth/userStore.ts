import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

const LOCAL_USERS_FILE = path.join(process.cwd(), ".data", "users.json");

async function readLocalUsers(): Promise<Record<string, UserRecord>> {
  try {
    const raw = await fs.readFile(LOCAL_USERS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeLocalUsers(data: Record<string, UserRecord>) {
  await fs.mkdir(path.dirname(LOCAL_USERS_FILE), { recursive: true });
  await fs.writeFile(LOCAL_USERS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const normalizedEmail = email.trim().toLowerCase();

  if (process.env.DATABASE_URL) {
    try {
      const { db } = await import("@db-optima/database");
      const { users } = await import("@db-optima/database/schema");

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);

      if (!user) return null;
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
      };
    } catch (e) {
      console.warn("Postgres lookup failed, falling back to local storage:", (e as Error).message);
    }
  }

  const users = await readLocalUsers();
  const found = Object.values(users).find((u) => u.email.toLowerCase() === normalizedEmail);
  return found ?? null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  if (process.env.DATABASE_URL) {
    try {
      const { db } = await import("@db-optima/database");
      const { users } = await import("@db-optima/database/schema");

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      if (!user) return null;
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
      };
    } catch (e) {
      console.warn("Postgres lookup failed, falling back to local storage:", (e as Error).message);
    }
  }

  const users = await readLocalUsers();
  return users[id] ?? null;
}

export async function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<UserRecord> {
  const normalizedEmail = data.email.trim().toLowerCase();
  const id = "usr_" + randomBytes(8).toString("hex");
  const now = new Date().toISOString();

  const record: UserRecord = {
    id,
    name: data.name.trim(),
    email: normalizedEmail,
    passwordHash: data.passwordHash,
    createdAt: now,
  };

  if (process.env.DATABASE_URL) {
    try {
      const { db } = await import("@db-optima/database");
      const { users } = await import("@db-optima/database/schema");

      await db.insert(users).values({
        id: record.id,
        name: record.name,
        email: record.email,
        passwordHash: record.passwordHash,
      });

      return record;
    } catch (e) {
      console.warn("Postgres insert failed, falling back to local storage:", (e as Error).message);
    }
  }

  const users = await readLocalUsers();
  users[id] = record;
  await writeLocalUsers(users);
  return record;
}
