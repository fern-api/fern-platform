import { PlaygroundEndpointSelectorContent } from "@/components/playground/endpoint/PlaygroundEndpointSelectorContent";
import { flattenApiSection } from "@/components/playground/utils/flatten-apis";
import { HorizontalSplitPane } from "@/components/playground/VerticalSplitPane";
import { createCachedDocsLoader } from "@/server/docs-loader";
import { COOKIE_FERN_TOKEN } from "@fern-docs/utils";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function Layout(
  props: {
    children: React.ReactNode;
    params: Promise<{ domain: string }>;
  }
) {
  const params = await props.params;

  const {
    children
  } = props;

  console.debug(`[${params.domain}] Loading API Explorer layout`);
  const fern_token = (await cookies()).get(COOKIE_FERN_TOKEN)?.value;
  const loader = await createCachedDocsLoader(params.domain, fern_token);
  const root = await loader.getRoot();
  if (!root) {
    console.error(`[${params.domain}] Root node not found`);
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
