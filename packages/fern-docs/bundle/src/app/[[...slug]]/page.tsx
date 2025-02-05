"use server";

import TableOfContentsServer from "@/client/components/table-of-contents/TableOfContentsServer";
import {
  createCachedDocsLoader,
  DocsLoader,
} from "@/server/cached-docs-loader";
import { createFindNode } from "@/server/find-node";
import { toImageDescriptor } from "@/utils/to-image-descriptor";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { getPageId } from "@fern-api/fdr-sdk/navigation";
import { getSeoDisabled } from "@fern-docs/edge-config";
import { getFrontmatter, markdownToString } from "@fern-docs/mdx";
import { getBreadcrumbList } from "@fern-docs/seo";
import { Breadcrumb } from "@fern-docs/seo/src/jsonld";
import { addLeadingSlash, conformTrailingSlash } from "@fern-docs/utils";
import { Metadata } from "next";
import ActiveTabIndex from "../tabs/active-tab-index";
import Article from "./article";
import Main from "./main";

export default async function Page({
  params,
}: {
  params: { slug?: string[] };
}) {
  const slug = FernNavigation.slugjoin(params.slug);
  const docsLoader = await createCachedDocsLoader();
  const findNode = createFindNode(docsLoader);
  const { node, parents, currentVersion, currentTab, authState } =
    await findNode(slug);
  const layout = await getLayout(docsLoader, node);
  const { contentWidth, pageWidth, sidebarWidth } =
    await docsLoader.getLayout();
  return (
    <>
      <Breadcrumb
        // TODO: add jsonld override from frontmatter
        breadcrumbList={getBreadcrumbList(docsLoader.domain, parents, node)}
      />
      <ActiveTabIndex tabId={currentTab?.id} />
      <Main
        layout={layout}
        contentWidth={contentWidth}
        pageWidth={pageWidth}
        sidebarWidth={sidebarWidth}
      >
        <TableOfContentsServer
          pageId={getPageId(node)}
          sidebarWidth={sidebarWidth}
          pageWidth={pageWidth}
        />
        <Article
          node={node}
          authState={authState}
          currentVersionId={currentVersion?.id}
          currentTabTitle={currentTab?.title}
        />
      </Main>
    </>
  );
}

const LAYOUTS = ["custom", "guide", "overview", "page", "reference"] as const;
type Layout = (typeof LAYOUTS)[number];

async function getLayout(
  docsLoader: DocsLoader,
  node: FernNavigation.NavigationNodePage
): Promise<Layout> {
  if (node.type === "changelogEntry") {
    return "guide";
  }

  if (node.type === "changelog") {
    return "reference";
  }

  const pageId = getPageId(node);
  if (pageId) {
    const page = await docsLoader.getPage(pageId);
    if (page) {
      const frontmatter = getFrontmatter(page.markdown)?.data;
      return frontmatter?.layout && LAYOUTS.includes(frontmatter.layout)
        ? frontmatter.layout
        : "guide";
    }
  }

  if (
    FernNavigation.isApiLeaf(node) ||
    FernNavigation.isApiReferenceNode(node) ||
    node.type === "apiPackage"
  ) {
    return "reference";
  }

  return "guide";
}

export async function generateMetadata({
  params,
}: {
  params: { slug?: string[] };
}): Promise<Metadata> {
  const slug = FernNavigation.slugjoin(params.slug);
  const docsLoader = await createCachedDocsLoader();
  const findNode = createFindNode(docsLoader);
  const [files, { node }, config, isSeoDisabled] = await Promise.all([
    docsLoader.getFiles(),
    findNode(slug),
    docsLoader.getConfig(),
    getSeoDisabled(docsLoader.domain),
  ]);
  const pageId = FernNavigation.getPageId(node);
  const page = pageId ? await docsLoader.getPage(pageId) : undefined;
  const frontmatter = page ? getFrontmatter(page.markdown)?.data : undefined;

  const noindex =
    (FernNavigation.hasMarkdown(node) && node.noindex) ||
    isSeoDisabled ||
    frontmatter?.noindex ||
    false;
  const nofollow = isSeoDisabled || frontmatter?.nofollow || false;

  return {
    title:
      markdownToString(
        frontmatter?.headline || frontmatter?.title || node.title
      ) ?? node.title,
    description: markdownToString(
      frontmatter?.description || frontmatter?.subtitle || frontmatter?.excerpt
    ),
    keywords: frontmatter?.keywords,
    robots: {
      index: noindex ? false : undefined,
      follow: nofollow ? false : undefined,
    },
    alternates: {
      canonical:
        frontmatter?.["canonical-url"] ??
        conformTrailingSlash(addLeadingSlash(node.canonicalSlug ?? node.slug)),
    },
    openGraph: {
      title: frontmatter?.["og:title"],
      description: frontmatter?.["og:description"],
      locale: frontmatter?.["og:locale"],
      url: frontmatter?.["og:url"],
      siteName: frontmatter?.["og:site_name"],
      images:
        toImageDescriptor(
          files,
          frontmatter?.["og:image"],
          frontmatter?.["og:image:width"],
          frontmatter?.["og:image:height"]
        ) ?? toImageDescriptor(files, frontmatter?.image),
    },
    twitter: {
      site: frontmatter?.["twitter:site"],
      creator: frontmatter?.["twitter:handle"],
      title: frontmatter?.["twitter:title"],
      description: frontmatter?.["twitter:description"],
      images: toImageDescriptor(files, frontmatter?.["twitter:image"]),
    },
    icons: {
      icon: config?.favicon
        ? toImageDescriptor(files, {
            type: "fileId",
            value: config.favicon,
          })?.url
        : undefined,
    },
  };
}
