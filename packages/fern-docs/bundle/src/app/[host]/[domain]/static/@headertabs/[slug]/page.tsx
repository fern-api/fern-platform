import "server-only";

import { FernNavigation } from "@fern-api/fdr-sdk";
import { slugjoin } from "@fern-api/fdr-sdk/navigation";

import { HeaderTabsList } from "@/components/header/HeaderTabsList";
import { createCachedDocsLoader } from "@/server/docs-loader";

export default async function HeaderTabsPage({
  params,
}: {
  params: Promise<{ host: string; domain: string; slug: string }>;
}) {
  const { host, domain, slug } = await params;
  const loader = await createCachedDocsLoader(host, domain);
  const rootPromise = loader.getRoot();
  const layout = await loader.getLayout();

  if (layout.tabsPlacement !== "HEADER") {
    return null;
  }

  const findNode = FernNavigation.utils.findNode(
    await rootPromise,
    slugjoin(slug)
  );

  if (findNode.type !== "found") {
    return null;
  }

  return <HeaderTabsList tabs={findNode.tabs} />;
}
