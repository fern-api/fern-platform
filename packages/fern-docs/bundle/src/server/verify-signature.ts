import { NextRequest } from "next/server";

import crypto from "crypto";

import { HEADER_X_VERCEL_SIGNATURE } from "@fern-docs/utils";

export async function verifySignature(
  req: NextRequest,
  secret: string | undefined
) {
  if (!secret) {
    return false;
  }

  const payload = await req.text();
  const signature = crypto
    .createHmac("sha1", secret)
    .update(payload)
    .digest("hex");
  return signature === req.headers.get(HEADER_X_VERCEL_SIGNATURE);
}
