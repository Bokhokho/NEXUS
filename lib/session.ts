import { createHmac, createHash } from "crypto";

const SECRET = process.env.SESSION_SECRET!;

export function signSession(payload: object): string {
  const data = JSON.stringify(payload);
  const b64 = Buffer.from(data).toString("base64");
  const sig = createHmac("sha256", SECRET).update(b64).digest("hex");
  return `${b64}.${sig}`;
}

export function verifySession(token: string): object | null {
  const dotIndex = token.lastIndexOf(".");
  if (dotIndex === -1) return null;
  const b64 = token.slice(0, dotIndex);
  const sig = token.slice(dotIndex + 1);
  const expected = createHmac("sha256", SECRET).update(b64).digest("hex");
  if (sig !== expected) return null;
  try {
    return JSON.parse(Buffer.from(b64, "base64").toString());
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}
