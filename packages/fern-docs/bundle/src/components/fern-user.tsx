import "server-only";

import { getFernToken } from "@/app/fern-token";
import { createCachedDocsLoader } from "@/server/docs-loader";
import { SetFernUser } from "@/state/fern-user";

export async function FernUser({
  host,
  domain,
}: {
  host: string;
  domain: string;
}) {
  const loader = await createCachedDocsLoader(
    host,
    domain,
    await getFernToken()
  );
  const authState = await loader.getAuthState();
  return <SetFernUser value={authState.authed ? authState.user : undefined} />;
}
