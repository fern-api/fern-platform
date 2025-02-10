import "server-only";

import { getEnv } from "@vercel/functions";

export function preferPreview(domain: string) {
  const { VERCEL_ENV, VERCEL_URL } = getEnv();
  if (VERCEL_ENV === "production") {
    return domain;
  }
  return VERCEL_URL || domain;
}
