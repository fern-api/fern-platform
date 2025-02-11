import "server-only";

import { createCachedDocsLoader } from "@/server/docs-loader";
import { SetFernUser } from "@/state/fern-user";

export async function FernUser({
  domain,
  fern_token,
}: {
  domain: string;
  fern_token?: string;
}) {
  const loader = await createCachedDocsLoader(domain, fern_token);
  const authState = await loader.getAuthState();
  return <SetFernUser value={authState.authed ? authState.user : undefined} />;
}
