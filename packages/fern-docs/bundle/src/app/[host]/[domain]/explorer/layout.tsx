import "server-only";

import { Metadata } from "next";

import { getFernToken } from "@/app/fern-token";
import { PlaygroundCloseButton } from "@/components/playground/PlaygroundCloseButton";
import { PlaygroundKeyboardTrigger } from "@/components/playground/PlaygroundKeyboardTrigger";
import { HorizontalSplitPane } from "@/components/playground/VerticalSplitPane";
import { createCachedDocsLoader } from "@/server/docs-loader";
import { ApiExplorerFlags } from "@/state/api-explorer-flags";

export default async function Layout({
  params,
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  params: Promise<{ host: string; domain: string }>;
}) {
  const { host, domain } = await params;

  console.debug(`[${domain}] Loading API Explorer layout`);
  const loader = await createCachedDocsLoader(
    host,
    domain,
    await getFernToken()
  );
  const edgeFlags = await loader.getEdgeFlags();

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
        {sidebar}
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
  };
}
