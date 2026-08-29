import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./password";
import { signToken, verifyToken } from "./jwt";

describe("Password Hashing & Verification", () => {
  it("hashes password and verifies correctly", async () => {
    const plain = "MySecretPassword123!";
    const hash = await hashPassword(plain);

    expect(hash).not.toBe(plain);
    expect(hash.length).toBeGreaterThan(20);

    const isMatch = await verifyPassword(plain, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await verifyPassword("WrongPassword", hash);
    expect(isWrongMatch).toBe(false);
  });
});

describe("JWT Signing & Verification", () => {
  it("signs and verifies a valid JWT payload", async () => {
    const user = {
      id: "usr_test123",
      name: "Alice Developer",
      email: "alice@example.com",
    };

    const token = await signToken(user);
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3); // Header.Payload.Signature

    const decoded = await verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.id).toBe(user.id);
    expect(decoded?.name).toBe(user.name);
    expect(decoded?.email).toBe(user.email);
  });

  it("returns null for tampered or invalid tokens", async () => {
    const validToken = await signToken({
      id: "usr_1",
      name: "Bob",
      email: "bob@example.com",
    });

    const tampered = validToken.slice(0, -5) + "abcde";
    const result = await verifyToken(tampered);
    expect(result).toBeNull();
  });
});
