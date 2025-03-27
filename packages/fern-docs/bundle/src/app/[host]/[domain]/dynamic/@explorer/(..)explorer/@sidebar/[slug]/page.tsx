import "server-only";

import { FernNavigation } from "@fern-api/fdr-sdk";
import { slugjoin } from "@fern-api/fdr-sdk/navigation";

import { getFernToken } from "@/app/fern-token";
import { PlaygroundEndpointSelectorContent } from "@/components/playground/endpoint/PlaygroundEndpointSelectorContent";
import { flattenApiSection } from "@/components/playground/utils/flatten-apis";
import { createCachedDocsLoader } from "@/server/docs-loader";

export default async function EndpointSelectorPage({
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
  const root = await loader.getRoot();

  const foundNode = FernNavigation.utils.findNode(root, slugjoin(slug));
  if (foundNode.type !== "found") {
    return null;
  }

  const currentVersion = foundNode.currentVersion?.versionId;
  const versionNode = foundNode.versions.find(
    (version) => version.versionId === currentVersion
  );
  const apiGroups = flattenApiSection(versionNode ?? root);

  return (
    <PlaygroundEndpointSelectorContent
      apiGroups={apiGroups}
      className="h-full"
      shallow
      replace
    />
  );
}
