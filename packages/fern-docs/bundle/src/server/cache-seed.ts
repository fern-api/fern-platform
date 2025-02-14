import "server-only";

import { getEnv } from "@vercel/functions";
import crypto from "node:crypto";

const seed = crypto.randomUUID();

export function cacheSeed() {
  const { VERCEL_GIT_COMMIT_SHA } = getEnv();
  return VERCEL_GIT_COMMIT_SHA ?? seed;
}
