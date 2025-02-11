import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { COOKIE_FERN_TOKEN } from "@fern-docs/utils";

import { HorizontalSplitPane } from "@/components/playground/VerticalSplitPane";
import { PlaygroundEndpointSelectorContent } from "@/components/playground/endpoint/PlaygroundEndpointSelectorContent";
import { flattenApiSection } from "@/components/playground/utils/flatten-apis";
import { createCachedDocsLoader } from "@/server/docs-loader";

export default async function Layout({
  params,
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;

  const cookieJar = await cookies();

  console.debug(`[${domain}] Loading API Explorer layout`);
  const fern_token = cookieJar.get(COOKIE_FERN_TOKEN)?.value;
  const loader = await createCachedDocsLoader(domain, fern_token);
  const root = await loader.getRoot();
  if (!root) {
    console.error(`[${domain}] Root node not found`);
    notFound();
  }
  const apiGroups = flattenApiSection(root);

  return (
    <main className="h-screen">
      <HorizontalSplitPane
        mode="pixel"
        className="size-full"
        leftClassName="border-default border-r"
      >
        <PlaygroundEndpointSelectorContent
          apiGroups={apiGroups}
          className="h-full"
          rootslug={root.slug}
        />
        {children}
      </HorizontalSplitPane>
    </main>
  );
}
