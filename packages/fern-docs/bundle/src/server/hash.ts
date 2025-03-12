import crypto from "crypto";

export function hash(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}
