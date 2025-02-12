import "server-only";

import { cookies } from "next/headers";

import { COOKIE_FERN_TOKEN } from "@fern-docs/utils";

export async function getFernToken() {
  const cookieJar = await cookies();
  return cookieJar.get(COOKIE_FERN_TOKEN)?.value;
}
