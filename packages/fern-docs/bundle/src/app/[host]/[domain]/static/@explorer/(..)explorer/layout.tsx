import { InterceptedPlaygroundCloseButton } from "@/components/playground/PlaygroundCloseButton";
import { PlaygroundDrawer } from "@/components/playground/PlaygroundDrawer";
import { HorizontalSplitPane } from "@/components/playground/VerticalSplitPane";
import { PlaygroundEndpointSelectorContent } from "@/components/playground/endpoint";
import { flattenApiSection } from "@/components/playground/utils/flatten-apis";
import { createCachedDocsLoader } from "@/server/docs-loader";
import { ApiExplorerFlags } from "@/state/api-explorer-flags";

export default async function ExplorerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ host: string; domain: string }>;
}) {
  const { host, domain } = await params;

  const loader = await createCachedDocsLoader(host, domain);
  const [edgeFlags, root] = await Promise.all([
    loader.getEdgeFlags(),
    loader.getRoot(),
  ]);

  const apiGroups = flattenApiSection(root);

  return (
    <PlaygroundDrawer>
      <InterceptedPlaygroundCloseButton />
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
        className="w-full flex-1 overflow-y-auto overscroll-contain"
        leftClassName="border-border-default border-r hidden lg:block"
      >
        <PlaygroundEndpointSelectorContent
          apiGroups={apiGroups}
          className="h-full"
          replace
        />
        {children}
      </HorizontalSplitPane>
    </PlaygroundDrawer>
  );
}

export function generateMetadata() {
  return {
    title: "API Explorer",
    description:
      "Browse, explore, and try out API endpoints without leaving the documentation.",
  };
}
