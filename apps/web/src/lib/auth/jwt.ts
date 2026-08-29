import { SignJWT, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET_RAW = process.env.JWT_SECRET || "db-optima-super-secure-jwt-secret-key-32-chars!";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_RAW);
const COOKIE_NAME = "auth-token";
const EXPIRES_IN = "7d";

export interface AuthUserPayload {
  id: string;
  name: string;
  email: string;
}

/**
 * Signs a JWT token with user claims and a 7-day expiration.
 */
export async function signToken(payload: AuthUserPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(JWT_SECRET);
}

/**
 * Verifies and decodes a JWT token. Returns null if invalid or expired.
 */
export async function verifyToken(token: string): Promise<AuthUserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload || !payload.id || !payload.email) return null;
    return {
      id: payload.id as string,
      name: (payload.name as string) || "",
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

/**
 * Extracts JWT token from either cookie or Authorization header.
 */
export function getTokenFromRequest(req: NextRequest): string | null {
  const cookieToken = req.cookies.get(COOKIE_NAME)?.value;
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }

  return null;
}

/**
 * Sets an httpOnly secure cookie containing the auth token on the response.
 */
export function setAuthCookie(res: NextResponse, token: string) {
  res.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  });
}

/**
 * Clears the auth cookie on logout.
 */
export function clearAuthCookie(res: NextResponse) {
  res.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
