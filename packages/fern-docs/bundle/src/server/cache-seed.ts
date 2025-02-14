"use server";

import { getEnv } from "@vercel/functions";

const seed = crypto.randomUUID();

export function cacheSeed() {
  const { VERCEL_GIT_COMMIT_SHA } = getEnv();
  return VERCEL_GIT_COMMIT_SHA ?? seed;
}
