import "server-only";

import { Metadata } from "next";

import { getFernToken } from "@/app/fern-token";
import { PlaygroundCloseButton } from "@/components/playground/PlaygroundCloseButton";
import { PlaygroundKeyboardTrigger } from "@/components/playground/PlaygroundKeyboardTrigger";
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
  params: Promise<{ host: string; domain: string }>;
}) {
  const { host, domain } = await params;

  console.debug(`[${domain}] Loading API Explorer layout`);
  const loader = await createCachedDocsLoader(
    host,
    domain,
    await getFernToken()
  );
  const [root, edgeFlags] = await Promise.all([
    loader.getRoot(),
    loader.getEdgeFlags(),
  ]);
  const apiGroups = flattenApiSection(root);

  return (
    <main className="fixed inset-0">
      <PlaygroundKeyboardTrigger />
      <PlaygroundCloseButton />
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
        leftClassName="border-border-default border-r hidden lg:block"
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ host: string; domain: string }>;
}): Promise<Metadata> {
  const { host, domain } = await params;
  const loader = await createCachedDocsLoader(host, domain);
  const config = await loader.getConfig();
  return {
    title: {
      default: "API Explorer",
      template: config.title ? "%s | " + config.title : "%s",
    },
    description:
      "Browse, explore, and try out API endpoints without leaving the documentation.",
    robots: "noindex, nofollow",
  };
}
