"use server";

import { PlaygroundEndpointSelectorContent } from "@/components/playground/endpoint/PlaygroundEndpointSelectorContent";
import { flattenApiSection } from "@/components/playground/utils/flatten-apis";
import { HorizontalSplitPane } from "@/components/playground/VerticalSplitPane";
import { createCachedDocsLoader } from "@/server/docs-loader";
import { getDocsDomainApp } from "@/server/xfernhost/app";
import { COOKIE_FERN_TOKEN } from "@fern-docs/utils";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const fern_token = cookies().get(COOKIE_FERN_TOKEN)?.value;
  const loader = await createCachedDocsLoader(getDocsDomainApp(), fern_token);
  const root = await loader.getRoot();
  if (!root) {
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
        />
        {children}
      </HorizontalSplitPane>
    </main>
  );
}
