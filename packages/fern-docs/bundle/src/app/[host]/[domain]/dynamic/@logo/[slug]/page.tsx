import "server-only";

import { FernNavigation } from "@fern-api/fdr-sdk";
import { getPageId, slugjoin } from "@fern-api/fdr-sdk/navigation";
import { getFrontmatter } from "@fern-docs/mdx";

import { getFernToken } from "@/app/fern-token";
import { Logo } from "@/components/logo";
import { createCachedDocsLoader } from "@/server/docs-loader";
import { createFileResolver } from "@/server/file-resolver";
import { withLogo } from "@/server/withLogo";

export default async function LogoPage({
  params,
}: {
  params: Promise<{ host: string; domain: string; slug: string }>;
}) {
  const { host, domain, slug } = await params;
  const loader = await createCachedDocsLoader(
    host,
    domain,
    await getFernToken()
  );

  const [{ basePath }, config, files, root] = await Promise.all([
    loader.getMetadata(),
    loader.getConfig(),
    loader.getFiles(),
    loader.getRoot(),
  ]);

  const resolveFileSrc = createFileResolver(files);
  const foundNode = FernNavigation.utils.findNode(root, slugjoin(slug));

  let frontmatter = null;
  if (foundNode.type === "found") {
    const pageId = getPageId(foundNode.node);
    if (pageId) {
      const page = await loader.getPage(pageId);
      frontmatter = page ? getFrontmatter(page.markdown) : null;
    }
  }

  return (
    <Logo
      logo={withLogo(config, resolveFileSrc, basePath, frontmatter?.data)}
      className="w-fit shrink-0"
    />
  );
}
