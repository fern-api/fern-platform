import "server-only";

import { createCachedDocsLoader } from "@/server/docs-loader";
import { SetFernUser } from "@/state/fern-user";

export async function FernUser({
  host,
  domain,
  fern_token,
}: {
  host: string;
  domain: string;
  fern_token?: string;
}) {
  const loader = await createCachedDocsLoader(host, domain, fern_token);
  const authState = await loader.getAuthState();
  return <SetFernUser value={authState.authed ? authState.user : undefined} />;
}
