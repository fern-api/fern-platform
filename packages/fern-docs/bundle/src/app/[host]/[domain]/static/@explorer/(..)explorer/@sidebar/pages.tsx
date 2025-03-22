import "server-only";

import { PlaygroundEndpointSelectorContent } from "@/components/playground/endpoint/PlaygroundEndpointSelectorContent";
import { flattenApiSection } from "@/components/playground/utils/flatten-apis";
import { createCachedDocsLoader } from "@/server/docs-loader";

export default async function EndpointSelectorPage({
  params,
}: {
  params: Promise<{ host: string; domain: string; slug: string }>;
}) {
  const { host, domain } = await params;

  console.debug(`[${domain}] Loading API Explorer endpoint selector`);
  const loader = await createCachedDocsLoader(host, domain);
  const root = await loader.getRoot();

  const apiGroups = flattenApiSection(root);

  return (
    <PlaygroundEndpointSelectorContent
      apiGroups={apiGroups}
      className="h-full"
      replace
    />
  );
}
