import "server-only";

import { getEnv } from "@vercel/functions";

import { once } from "./once";

const seed = once(() => crypto.randomUUID());

export function cacheSeed() {
  const { VERCEL_GIT_COMMIT_SHA } = getEnv();
  return VERCEL_GIT_COMMIT_SHA ?? seed();
}
