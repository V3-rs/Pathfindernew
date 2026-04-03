import { createHmac, createHash } from "crypto";

const SESSION_SECRET =
  process.env.SESSION_SECRET || "pathfinder-employer-secret-2026";

export function hashPassword(password: string): string {
  return createHash("sha256")
    .update(password + "pathfinder-salt-v1")
    .digest("hex");
}

export interface SessionPayload {
  id: string;
  email: string;
  company_id?: string;
}

export function createToken(payload: SessionPayload): string {
  const data = Buffer.from(
    JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })
  ).toString("base64url");
  const sig = createHmac("sha256", SESSION_SECRET)
    .update(data)
    .digest("hex");
  return `${data}.${sig}`;
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    const dotIdx = token.lastIndexOf(".");
    if (dotIdx === -1) return null;
    const data = token.slice(0, dotIdx);
    const sig = token.slice(dotIdx + 1);
    const expected = createHmac("sha256", SESSION_SECRET)
      .update(data)
      .digest("hex");
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(data, "base64url").toString());
    if (payload.exp < Date.now()) return null;
    return { id: payload.id, email: payload.email, company_id: payload.company_id };
  } catch {
    return null;
  }
}

export function getSessionFromRequest(request: Request): SessionPayload | null {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/employer_token=([^;]+)/);
  if (!match) return null;
  return verifyToken(decodeURIComponent(match[1]));
}

export function SESSION_COOKIE_OPTIONS(token: string) {
  return {
    name: "employer_token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  };
}
