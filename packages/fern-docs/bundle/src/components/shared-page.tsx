import "server-only";

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
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { getSeoDisabled } from "@fern-docs/edge-config";
import { getFrontmatter, markdownToString } from "@fern-docs/mdx";
import { getRedirectForPath, slugToHref } from "@fern-docs/utils";

import { toImageDescriptor } from "@/app/seo";
import FeedbackPopover from "@/components/feedback/FeedbackPopover";
import { DocsLoader } from "@/server/docs-loader";
import { createFindNode } from "@/server/find-node";
import { withLaunchDarkly } from "@/server/ld-adapter";
import {
  MdxSerializer,
  createCachedMdxSerializer,
} from "@/server/mdx-serializer";
import { withPrunedNavigationLoader } from "@/server/withPrunedNavigation";
import { SetIsLandingPage } from "@/state/layout";
import { SetCurrentNavigationNode } from "@/state/navigation";

import { DocsMainContent } from "../app/[host]/[domain]/main";

export default async function SharedPage({
  loader,
  slug,
}: {
  loader: DocsLoader;
  slug: Slug;
}) {
  console.debug("/app/[domain]/_page.tsx: starting...");

  // start loading the root node early
  const rootPromise = loader.getRoot();
  const baseUrlPromise = loader.getMetadata();
  const configPromise = loader.getConfig();
  const authStatePromise = loader.getAuthState(slugToHref(slug));
  const edgeFlagsPromise = loader.getEdgeFlags();

  // check for redirects
  const configuredRedirect = getRedirectForPath(
    slugToHref(slug),
    await baseUrlPromise,
    (await configPromise).redirects
  );

  if (configuredRedirect != null) {
    const redirectFn = configuredRedirect.permanent
      ? permanentRedirect
      : redirect;
    redirectFn(prepareRedirect(configuredRedirect.destination));
  }

  // get the root node
  let root: FernNavigation.RootNode | undefined = await rootPromise;

  // always match the basepath of the root node
  if (!slug.startsWith(root.slug)) {
    redirect(prepareRedirect(root.slug));
  }

  // naively find the current node id to prune the navigation tree
  const currentNodeId = FernNavigation.NodeCollector.collect(root)
    .getSlugMapWithParents()
    .get(slug)?.node.id;

  // prune the tree so that neighbors don't include authed nodes or hidden nodes
  root = await withPrunedNavigationLoader(
    root,
    loader,
    currentNodeId ? [currentNodeId] : undefined
  );

  if (root == null) {
    notFound();
  }

  // find the node that is currently being viewed
  const found = FernNavigation.utils.findNode(root, slug);

  const authState = await authStatePromise;

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
    console.error(`[${loader.domain}] Not found: ${slug}`);

    const edgeFlags = await edgeFlagsPromise;

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

  const serialize = createCachedMdxSerializer(loader, {
    scope: {
      version: found?.currentVersion?.versionId,
      tab: found?.currentTab?.title,
    },
  });

  const neighborsPromise = getNeighbors(loader, serialize, found);

  // if the current node requires authentication and the user is not authenticated, redirect to the auth page
  if (found.node.authed && !authState.authed) {
    console.error(`[${loader.domain}] Not authed: ${slug}`);

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
  const [_, flagPredicate] = await withLaunchDarkly(loader, found);

  if (
    ![...found.parents, found.node]
      .filter(FernNavigation.hasMetadata)
      .every((node) => flagPredicate(node))
  ) {
    console.error(`[${loader.domain}] Feature flag predicate failed: ${slug}`);
    notFound();
  }

  // note: we start from the version node because endpoint Ids can be duplicated across versions
  // if we introduce versioned sections, and versioned api references, this logic will need to change
  // const apiReferenceNodes = FernNavigation.utils.collectApiReferences(
  //   found.currentVersion ?? found.node
  // );

  const { isInlineFeedbackEnabled } = await edgeFlagsPromise;
  const FeedbackPopoverProvider = isInlineFeedbackEnabled
    ? FeedbackPopover
    : React.Fragment;

  return (
    <FeedbackPopoverProvider>
      <SetCurrentNavigationNode
        nodeId={found.node.id}
        sidebarRootNodeId={found.sidebar?.id}
        tabId={found.currentTab?.id}
        versionId={found.currentVersion?.versionId}
        versionSlug={found.currentVersion?.slug}
        versionIsDefault={found.isCurrentVersionDefault}
      />
      <SetIsLandingPage value={found.node.type === "landingPage"} />
      <DocsMainContent
        loader={loader}
        serialize={serialize}
        node={found.node}
        parents={found.parents}
        neighbors={await neighborsPromise}
        breadcrumb={found.breadcrumb}
      />
    </FeedbackPopoverProvider>
  );
}

export async function generateMetadata({
  loader,
  slug,
}: {
  loader: DocsLoader;
  slug: Slug;
}): Promise<Metadata> {
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
    node.hidden ||
    isSeoDisabled ||
    frontmatter?.noindex ||
    false;
  const nofollow =
    node?.hidden || isSeoDisabled || frontmatter?.nofollow || false;

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
          ? `${withDefaultProtocol(loader.domain)}${slugToHref(
              node.canonicalSlug ?? node.slug
            )}`
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
    destination = encodeURI(slugToHref(destination));
  }
  return destination;
}

async function getNeighbor(
  loader: DocsLoader,
  serialize: MdxSerializer,
  node: FernNavigation.NavigationNodeNeighbor | undefined
): Promise<
  | {
      href: string;
      title: string;
      excerpt?: string;
    }
  | undefined
> {
  if (node == null) {
    return undefined;
  }
  const pageId = FernNavigation.getPageId(node);
  if (pageId == null) {
    return {
      href: slugToHref(node.slug),
      title: node.title,
    };
  }
  try {
    const page = await loader.getPage(pageId);
    const mdx = await serialize(page.markdown, {
      filename: page.filename,
      slug: node.slug,
      toc: true, // this is probably already cached with toc: true
    });
    const excerpt = mdx?.frontmatter?.subtitle ?? mdx?.frontmatter?.excerpt;
    return {
      href: slugToHref(node.slug),
      title: mdx?.frontmatter?.title ?? node.title,
      excerpt,
    };
  } catch (error) {
    console.error(error);
    return {
      href: slugToHref(node.slug),
      title: node.title,
    };
  }
}

async function getNeighbors(
  loader: DocsLoader,
  serialize: MdxSerializer,
  neighbors: {
    prev: FernNavigation.NavigationNodeNeighbor | undefined;
    next: FernNavigation.NavigationNodeNeighbor | undefined;
  }
): Promise<{
  prev?: {
    href: string;
    title: string;
    excerpt?: string;
  };
  next?: {
    href: string;
    title: string;
    excerpt?: string;
  };
}> {
  const [prev, next] = await Promise.all([
    getNeighbor(loader, serialize, neighbors.prev),
    getNeighbor(loader, serialize, neighbors.next),
  ]);
  return { prev, next };
}
