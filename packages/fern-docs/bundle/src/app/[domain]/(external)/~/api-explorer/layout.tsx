import { cookies } from "next/headers";

import { COOKIE_FERN_TOKEN } from "@fern-docs/utils";

import { HorizontalSplitPane } from "@/components/playground/VerticalSplitPane";
import { PlaygroundEndpointSelectorContent } from "@/components/playground/endpoint/PlaygroundEndpointSelectorContent";
import { flattenApiSection } from "@/components/playground/utils/flatten-apis";
import { createCachedDocsLoader } from "@/server/docs-loader";
import { ApiExplorerFlags } from "@/state/api-explorer-flags";

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
  const [root, edgeFlags] = await Promise.all([
    loader.getRoot(),
    loader.getEdgeFlags(),
  ]);
  const apiGroups = flattenApiSection(root);

  return (
    <main className="h-screen">
      <ApiExplorerFlags
        isFileForgeHackEnabled={edgeFlags.isFileForgeHackEnabled}
        isProxyDisabled={edgeFlags.isProxyDisabled}
        hasVoiceIdPlaygroundForm={edgeFlags.hasVoiceIdPlaygroundForm}
        usesApplicationJsonInFormDataValue={
          edgeFlags.usesApplicationJsonInFormDataValue
        }
        isBinaryOctetStreamAudioPlayer={
          edgeFlags.isBinaryOctetStreamAudioPlayer
        }
      />
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
