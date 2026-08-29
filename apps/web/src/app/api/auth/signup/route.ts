import { NextRequest, NextResponse } from "next/server";
import { SignupRequestSchema } from "@/lib/utils/validators";
import { findUserByEmail, createUser } from "@/lib/auth/userStore";
import { hashPassword } from "@/lib/auth/password";
import { signToken, setAuthCookie } from "@/lib/auth/jwt";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SignupRequestSchema.safeParse(body);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        { error: "Validation failed", message: issue?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // Check if user already exists
    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "Email in use", message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Hash password & create user
    const passwordHash = await hashPassword(password);
    const user = await createUser({ name, email, passwordHash });

    // Generate JWT token
    const token = await signToken({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    });

    // Attach httpOnly cookie
    setAuthCookie(response, token);
    return response;
  } catch (err) {
    console.error("[/api/auth/signup POST]", err);
    return NextResponse.json(
      { error: "Signup failed", message: (err as Error).message },
      { status: 500 }
    );
  }
}
