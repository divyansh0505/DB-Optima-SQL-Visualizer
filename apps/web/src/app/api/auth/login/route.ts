import { NextRequest, NextResponse } from "next/server";
import { LoginRequestSchema } from "@/lib/utils/validators";
import { findUserByEmail } from "@/lib/auth/userStore";
import { verifyPassword } from "@/lib/auth/password";
import { signToken, setAuthCookie } from "@/lib/auth/jwt";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginRequestSchema.safeParse(body);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        { error: "Validation failed", message: issue?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // Find user by email
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials", message: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Verify password hash
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials", message: "Invalid email or password." },
        { status: 401 }
      );
    }

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
    console.error("[/api/auth/login POST]", err);
    return NextResponse.json(
      { error: "Login failed", message: (err as Error).message },
      { status: 500 }
    );
  }
}
