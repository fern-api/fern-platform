import "server-only";

import { cookies } from "next/headers";

import { COOKIE_FERN_TOKEN } from "@fern-docs/utils";

import { createCachedDocsLoader } from "@/server/docs-loader";
import { SetFernUser } from "@/state/fern-user";

export async function FernUser({ domain }: { domain: string }) {
  const cookieJar = await cookies();
  const fern_token = cookieJar.get(COOKIE_FERN_TOKEN)?.value;
  const loader = await createCachedDocsLoader(domain, fern_token);
  const authState = await loader.getAuthState();
  return <SetFernUser value={authState.authed ? authState.user : undefined} />;
}
