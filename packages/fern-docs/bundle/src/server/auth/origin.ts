import "server-only";

import { getEnv } from "@vercel/functions";

export function preferPreview(host: string, domain: string) {
  const { VERCEL_ENV } = getEnv();
  if (VERCEL_ENV === "production") {
    return domain;
  }
  return host || domain;
}
