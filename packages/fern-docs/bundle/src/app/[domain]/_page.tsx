import {
  notFound,
  permanentRedirect,
  redirect,
  unauthorized,
} from "next/navigation";
import { Metadata } from "next/types";
import React from "react";

import { FernNavigation } from "@fern-api/fdr-sdk";
import { Slug } from "@fern-api/fdr-sdk/navigation";
import visitDiscriminatedUnion from "@fern-api/ui-core-utils/visitDiscriminatedUnion";
import { getSeoDisabled } from "@fern-docs/edge-config";
import { getFrontmatter, markdownToString } from "@fern-docs/mdx";
import {
  addLeadingSlash,
  conformTrailingSlash,
  getRedirectForPath,
  isTrailingSlashEnabled,
} from "@fern-docs/utils";
import { SidebarTab } from "@fern-platform/fdr-utils";

import { getFernToken } from "@/app/fern-token";
import { toImageDescriptor } from "@/app/seo";
import { HydrateAtoms } from "@/components/atoms/docs";
import type { DocsProps } from "@/components/atoms/types";
import FeedbackPopover from "@/components/feedback/FeedbackPopover";
import { DocsContent } from "@/components/resolver/DocsContent";
import { DocsLoader } from "@/server/docs-loader";
import { createCachedDocsLoader } from "@/server/docs-loader";
import { createFindNode } from "@/server/find-node";
import { withLaunchDarkly } from "@/server/ld-adapter";
import { createCachedMdxSerializer } from "@/server/mdx-serializer";
import {
  pruneNavigationPredicate,
  withPrunedNavigation,
} from "@/server/withPrunedNavigation";
import { withVersionSwitcherInfo } from "@/server/withVersionSwitcherInfo";

import { DocsMainContent } from "./main";

export default async function Page({
  domain,
  slug,
  static: disableAuth,
}: {
  domain: string;
  slug: Slug;
  static?: boolean;
}) {
  console.debug("/app/[domain]/_page.tsx: starting...");

  const loader = await createCachedDocsLoader(
    domain,
    disableAuth ? undefined : await getFernToken()
  );
  const [baseUrl, config, authState, edgeFlags, colors] = await Promise.all([
    loader.getBaseUrl(),
    loader.getConfig(),
    loader.getAuthState(conformTrailingSlash(addLeadingSlash(slug))),
    loader.getEdgeFlags(),
    loader.getColors(),
  ]);

  // check for redirects
  const configuredRedirect = getRedirectForPath(
    conformTrailingSlash(addLeadingSlash(slug)),
    baseUrl,
    config.redirects
  );

  if (configuredRedirect != null) {
    const redirectFn = configuredRedirect.permanent
      ? permanentRedirect
      : redirect;
    redirectFn(prepareRedirect(configuredRedirect.destination));
  }

  // get the root node
  const root = await loader.getRoot();

  // always match the basepath of the root node
  if (!slug.startsWith(root.slug)) {
    redirect(prepareRedirect(root.slug));
  }

  // find the node that is currently being viewed
  const found = FernNavigation.utils.findNode(root, slug);

  // this is a special case for when the user is not authenticated, but the not-found status originates from an authed node
  if (
    found.type === "notFound" &&
    found.authed &&
    !authState.authed &&
    authState.authorizationUrl != null
  ) {
    redirect(prepareRedirect(authState.authorizationUrl));
  }

  if (found.type === "notFound") {
    console.error(`[${domain}] Not found: ${slug}`);

    // TODO: returning "notFound: true" here will render vercel's default 404 page
    // this is better than following redirects, since it will signal a proper 404 status code.
    // however, we should consider rendering a custom 404 page in the future using the customer's branding.
    // see: https://nextjs.org/docs/app/api-reference/file-conventions/not-found
    if (edgeFlags.is404PageHidden && found.redirect != null) {
      redirect(prepareRedirect(found.redirect));
    }

    notFound();
  }

  if (found.type === "redirect") {
    redirect(prepareRedirect(found.redirect));
  }

  // if the current node requires authentication and the user is not authenticated, redirect to the auth page
  if (found.node.authed && !authState.authed) {
    console.error(`[${domain}] Not authed: ${slug}`);

    // if the page can be considered an edge node when it's unauthed, then we'll follow the redirect
    if (FernNavigation.hasRedirect(found.node)) {
      redirect(prepareRedirect(found.node.pointsTo));
    }

    if (authState.authorizationUrl == null) {
      unauthorized();
    }

    redirect(prepareRedirect(authState.authorizationUrl));
  }

  // TODO: parallelize this with the other edge config calls:
  const [launchDarkly, flagPredicate] = await withLaunchDarkly(loader, found);

  if (
    ![...found.parents, found.node]
      .filter(FernNavigation.hasMetadata)
      .every((node) => flagPredicate(node))
  ) {
    console.error(`[${domain}] Feature flag predicate failed: ${slug}`);
    notFound();
  }

  const pruneOpts = {
    visibleNodeIds: [found.node.id],
    authed: authState.authed,
    // when true, all unauthed pages are visible, but rendered with a LOCK button
    // so they're not actually "pruned" from the sidebar
    // TODO: move this out of a feature flag and into the navigation node metadata
    discoverable: edgeFlags.isAuthenticatedPagesDiscoverable
      ? (true as const)
      : undefined,
  };

  const currentVersionId = found.currentVersion?.versionId;
  const versions = withVersionSwitcherInfo({
    node: found.node,
    parents: found.parents,
    versions: found.versions.filter(
      (version) =>
        pruneNavigationPredicate(version, pruneOpts) ||
        version.versionId === currentVersionId
    ),
    slugMap: found.collector.slugMap,
  });

  const sidebar = withPrunedNavigation(found.sidebar, pruneOpts);

  const filteredTabs = found.tabs.filter(
    (tab) =>
      pruneNavigationPredicate(tab, pruneOpts) || tab === found.currentTab
  );

  const tabs = filteredTabs.map((tab, index) =>
    visitDiscriminatedUnion(tab)._visit<SidebarTab>({
      tab: (tab) => ({
        type: "tabGroup",
        title: tab.title,
        icon: tab.icon,
        index,
        slug: tab.slug,
        pointsTo: tab.pointsTo,
        hidden: tab.hidden,
        authed: tab.authed,
      }),
      link: (link) => ({
        type: "tabLink",
        title: link.title,
        icon: link.icon,
        index,
        url: link.url,
      }),
      changelog: (changelog) => ({
        type: "tabChangelog",
        title: changelog.title,
        icon: changelog.icon,
        index,
        slug: changelog.slug,
        hidden: changelog.hidden,
        authed: changelog.authed,
      }),
    })
  );

  const currentTabIndex =
    found.currentTab == null
      ? undefined
      : filteredTabs.indexOf(found.currentTab);

  const [neighbors] = await Promise.all([
    getNeighbors({ prev: found.prev, next: found.next }, loader),
  ]);

  const props: DocsProps = {
    baseUrl: baseUrl,
    layout: config.layout,
    title: config.title,
    favicon: config.favicon,
    colors,
    navigation: {
      currentTabIndex,
      tabs,
      currentVersionId,
      versions,
      sidebar,
      trailingSlash: isTrailingSlashEnabled(),
    },
    defaultLang: config.defaultLanguage ?? "curl",
    featureFlagsConfig: {
      launchDarkly,
    },
  };

  // note: we start from the version node because endpoint Ids can be duplicated across versions
  // if we introduce versioned sections, and versioned api references, this logic will need to change
  // const apiReferenceNodes = FernNavigation.utils.collectApiReferences(
  //   found.currentVersion ?? found.node
  // );

  const FeedbackPopoverProvider = edgeFlags.isInlineFeedbackEnabled
    ? FeedbackPopover
    : React.Fragment;

  return (
    <HydrateAtoms pageProps={props}>
      <FeedbackPopoverProvider>
        <DocsMainContent
          loader={loader}
          node={found.node}
          parents={found.parents}
          neighbors={neighbors}
          breadcrumb={found.breadcrumb}
          // apiReferenceNodes={apiReferenceNodes}
          scope={{
            authed: authState.authed,
            user: authState.authed ? authState.user : undefined,
            version: found?.currentVersion?.versionId,
            tab: found?.currentTab?.title,
            slug: slug,
          }}
        />
      </FeedbackPopoverProvider>
    </HydrateAtoms>
  );
}

export async function generateMetadata({
  domain,
  slug,
  static: disableAuth,
}: {
  domain: string;
  slug: Slug;
  static?: boolean;
}): Promise<Metadata> {
  const loader = await createCachedDocsLoader(
    domain,
    disableAuth ? undefined : await getFernToken()
  );
  const findNode = createFindNode(loader);
  const [files, node, config, isSeoDisabled] = await Promise.all([
    loader.getFiles(),
    findNode(slug),
    loader.getConfig(),
    getSeoDisabled(loader.domain),
  ]);
  const pageId = node != null ? FernNavigation.getPageId(node) : undefined;
  const page = pageId ? await loader.getPage(pageId) : undefined;
  const frontmatter = page ? getFrontmatter(page.markdown)?.data : undefined;

  const noindex =
    node == null ||
    (FernNavigation.hasMarkdown(node) && node.noindex) ||
    isSeoDisabled ||
    frontmatter?.noindex ||
    false;
  const nofollow = isSeoDisabled || frontmatter?.nofollow || false;

  return {
    title:
      markdownToString(
        frontmatter?.headline || frontmatter?.title || node?.title
      ) ?? node?.title,
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
        (node != null
          ? conformTrailingSlash(
              addLeadingSlash(node.canonicalSlug ?? node.slug)
            )
          : undefined),
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
      icon: config.favicon
        ? toImageDescriptor(files, {
            type: "fileId",
            value: config.favicon,
          })?.url
        : undefined,
    },
  };
}

function prepareRedirect(destination: string): string {
  if (destination.startsWith("http://") || destination.startsWith("https://")) {
    // triggers a throw in the server-side if the destination url is invalid
    const url = new URL(destination);
    destination = String(url);
  } else {
    destination = encodeURI(addLeadingSlash(destination));
  }
  return destination;
}

async function getNeighbor(
  loader: DocsLoader,
  node: FernNavigation.NavigationNodeNeighbor | undefined
): Promise<DocsContent.Neighbor | null> {
  if (node == null) {
    return null;
  }
  const pageId = FernNavigation.getPageId(node);
  if (pageId == null) {
    return null;
  }
  try {
    const page = await loader.getPage(pageId);
    const { data: frontmatter } = getFrontmatter(page.markdown);
    const excerpt = frontmatter.subtitle ?? frontmatter.excerpt;
    const serialize = createCachedMdxSerializer(loader.domain);
    const mdx = await serialize(excerpt);
    return {
      slug: node.slug,
      title: node.title,
      excerpt: mdx ? { code: mdx.code } : excerpt,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function getNeighbors(
  neighbors: {
    prev: FernNavigation.NavigationNodeNeighbor | undefined;
    next: FernNavigation.NavigationNodeNeighbor | undefined;
  },
  loader: DocsLoader
): Promise<DocsContent.Neighbors> {
  const [prev, next] = await Promise.all([
    getNeighbor(loader, neighbors.prev),
    getNeighbor(loader, neighbors.next),
  ]);
  return { prev, next };
}
