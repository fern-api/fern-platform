import { FernNavigation } from "@fern-api/fdr-sdk";
import { slugjoin } from "@fern-api/fdr-sdk/navigation";

import { HeaderTabsList } from "@/components/header/HeaderTabsList";
import { createCachedDocsLoader } from "@/server/docs-loader";

export default async function HeaderTabsPage({
  params,
}: {
  params: Promise<{ domain: string; slug: string[] }>;
}) {
  const { domain, slug } = await params;
  const loader = await createCachedDocsLoader(domain);
  const root = await loader.getRoot();
  const findNode = FernNavigation.utils.findNode(root, slugjoin(slug));
  if (findNode.type !== "found") {
    return null;
  }

  return <HeaderTabsList tabs={findNode.tabs} />;
}
