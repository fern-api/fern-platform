import "server-only";

import { FernNavigation } from "@fern-api/fdr-sdk";
import { slugjoin } from "@fern-api/fdr-sdk/navigation";

import { getFernToken } from "@/app/fern-token";
import { VersionDropdown } from "@/components/header/VersionDropdown";
import { createCachedDocsLoader } from "@/server/docs-loader";

export default async function VersionSelectPage({
  params,
}: {
  params: Promise<{ host: string; domain: string; slug: string }>;
}) {
  const { host, domain, slug } = await params;
  const loader = await createCachedDocsLoader(
    host,
    domain,
    await getFernToken()
  );

  const rootPromise = loader.getRoot();

  // preload:
  loader.getLayout();
  loader.getAuthState();
  loader.getEdgeFlags();

  const foundNode = FernNavigation.utils.findNode(
    await rootPromise,
    slugjoin(slug)
  );
  if (foundNode.type !== "found") {
    return null;
  }

  return (
    <>
      <VersionDropdown
        loader={loader}
        currentNode={foundNode.node}
        slugMap={foundNode.collector.slugMap}
        parents={Array.from(foundNode.parents)}
      />
    </>
  );
}
