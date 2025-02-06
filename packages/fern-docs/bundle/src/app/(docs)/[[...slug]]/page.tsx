"use server";

import { withCustomJavascript } from "@/components/atoms/docs";
import type { DocsProps, NavbarLink } from "@/components/atoms/types";
import { DocsMainContent } from "@/components/docs/DocsMainContent";
import { DocsPage } from "@/components/docs/DocsPage";
import { NextApp } from "@/components/docs/NextApp";
import FeedbackPopover from "@/components/feedback/FeedbackPopover";
import { serializeMdx } from "@/components/mdx/bundlers/mdx-bundler";
import { DocsContent } from "@/components/resolver/DocsContent";
import { ThemedDocs } from "@/components/themes/ThemedDocs";
import { getApiRouteSupplier } from "@/components/util/getApiRouteSupplier";
import { getGitHubInfo, getGitHubRepo } from "@/components/util/github";
import { getOrigin } from "@/server/auth/origin";
import { getReturnToQueryParam } from "@/server/auth/return-to";
import { createCachedDocsLoader, DocsLoader } from "@/server/docs-loader";
import { createFileResolver } from "@/server/file-resolver";
import { createFindNode } from "@/server/find-node";
import { withLaunchDarkly } from "@/server/ld-adapter";
import { withLogo } from "@/server/withLogo";
import {
  pruneNavigationPredicate,
  withPrunedNavigation,
} from "@/server/withPrunedNavigation";
import { withVersionSwitcherInfo } from "@/server/withVersionSwitcherInfo";
import { getDocsDomainApp } from "@/server/xfernhost/app";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import visitDiscriminatedUnion from "@fern-api/ui-core-utils/visitDiscriminatedUnion";
import {
  getCustomerAnalytics,
  getEdgeFlags,
  getSeoDisabled,
} from "@fern-docs/edge-config";
import { getFrontmatter, markdownToString } from "@fern-docs/mdx";
import {
  addLeadingSlash,
  conformTrailingSlash,
  getRedirectForPath,
  isTrailingSlashEnabled,
} from "@fern-docs/utils";
import { SidebarTab } from "@fern-platform/fdr-utils";
import { cookies } from "next/headers";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { Metadata } from "next/types";
import React from "react";
import urlJoin from "url-join";
import { toImageDescriptor } from "../../seo";

export default async function Page({
  params,
}: {
  params: { slug?: string[] };
}) {
  const domain = getDocsDomainApp();
  const fern_token = cookies().get("fern_token")?.value;
  const slug = FernNavigation.slugjoin(params.slug);
  const loader = await createCachedDocsLoader(domain, fern_token);
  const [baseUrl, config, authState, edgeFlags, colors] = await Promise.all([
    loader.getBaseUrl(),
    loader.getConfig(),
    loader.getAuthState(addLeadingSlash(slug)),
    getEdgeFlags(loader.domain),
    loader.getColors(),
  ]);

  // check for redirects
  const configuredRedirect = getRedirectForPath(
    addLeadingSlash(slug),
    baseUrl,
    config?.redirects
  );

  if (configuredRedirect != null) {
    const redirectFn = configuredRedirect.permanent
      ? permanentRedirect
      : redirect;
    redirectFn(prepareRedirect(configuredRedirect.destination));
  }

  // get the root node
  const root = await loader.getRoot();

  // this should not happen, but if it does, we should return a 404
  if (root == null) {
    // TODO: sentry

    console.error("Root node not found");
    notFound();
  }

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
    // if the page can be considered an edge node when it's unauthed, then we'll follow the redirect
    if (FernNavigation.hasRedirect(found.node)) {
      redirect(prepareRedirect(found.node.pointsTo));
    }

    // TODO: there's currently no way to express a 401 or 403 in Next.js so we'll redirect to 404.
    // ideally this is handled in the middleware, and this should be a 500 error.
    if (authState.authorizationUrl == null) {
      notFound();
    }
    redirect(prepareRedirect(authState.authorizationUrl));
  }

  // TODO: parallelize this with the other edge config calls:
  const [launchDarkly, flagPredicate] = await withLaunchDarkly(
    loader.domain,
    authState,
    found
  );

  if (
    ![...found.parents, found.node]
      .filter(FernNavigation.hasMetadata)
      .every((node) => flagPredicate(node))
  ) {
    notFound();
  }

  const getApiRoute = getApiRouteSupplier({
    basepath: baseUrl.basePath,
    includeTrailingSlash: isTrailingSlashEnabled(),
  });

  const navbarLinks: NavbarLink[] = [];

  config?.navbarLinks?.forEach((link) => {
    if (link.type === "github") {
      navbarLinks.push({
        type: "github",
        href: link.url,
        className: undefined,
        id: undefined,
      });
    } else {
      navbarLinks.push({
        type: link.type,
        href: link.url,
        text: link.text,
        icon: link.icon,
        rightIcon: link.rightIcon,
        rounded: link.rounded,
        className: undefined,
        id: undefined,
      });
    }
  });

  // TODO: This is a hack to add a login button to the navbar. This should be done in a more generic way.
  if (
    loader.authConfig?.type === "basic_token_verification" &&
    !authState.authed
  ) {
    const redirect = new URL(withDefaultProtocol(loader.authConfig.redirect));
    redirect.searchParams.set(
      getReturnToQueryParam(loader.authConfig),
      urlJoin(getOrigin(), slug)
    );

    navbarLinks.push({
      type: "outlined",
      text: "Login",
      href: redirect.toString(),
      icon: undefined,
      rightIcon: undefined,
      rounded: false,
      className: undefined,
      id: "fern-docs-login-button",
    });
  }

  // TODO: This is a hack to add a logout button to the navbar. This should be done in a more generic way.
  if (authState.authed) {
    const logout = new URL(
      getApiRoute("/api/fern-docs/auth/logout"),
      withDefaultProtocol(getOrigin())
    );
    logout.searchParams.set(
      getReturnToQueryParam(loader.authConfig),
      urlJoin(withDefaultProtocol(getOrigin()), slug)
    );

    navbarLinks.push({
      type: "outlined",
      text: "Logout",
      href: logout.toString(),
      icon: undefined,
      rightIcon: undefined,
      rounded: false,
      className: undefined,
      id: "fern-docs-logout-button",
    });
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

  const pageId = FernNavigation.getPageId(found.node);
  const [page, files, neighbors, analytics, announcmentMdx] = await Promise.all(
    [
      pageId != null ? loader.getPage(pageId) : undefined,
      loader.getFiles(),
      getNeighbors({ prev: found.prev, next: found.next }, loader),
      getCustomerAnalytics(baseUrl.domain, baseUrl.basePath),
      config?.announcement?.text != null
        ? serializeMdx(config.announcement.text)
        : undefined,
    ]
  );

  const frontmatter =
    page != null ? getFrontmatter(page.markdown).data : undefined;
  const announcementText = config?.announcement?.text;

  const fileResolver = createFileResolver(files);
  const props: DocsProps = {
    baseUrl: baseUrl,
    layout: config?.layout,
    title: config?.title,
    favicon: config?.favicon,
    colors,
    js: withCustomJavascript(config?.js, fileResolver),
    navbarLinks,
    logo: withLogo(config, found, frontmatter, fileResolver),
    announcement:
      announcmentMdx && announcementText
        ? { mdx: announcmentMdx, text: announcementText }
        : undefined,
    navigation: {
      currentTabIndex,
      tabs,
      currentVersionId,
      versions,
      sidebar,
      trailingSlash: isTrailingSlashEnabled(),
    },
    edgeFlags,
    user: authState.authed ? authState.user : undefined,
    fallback: {},

    analytics,
    theme: edgeFlags.isCohereTheme ? "cohere" : "default",
    analyticsConfig: config?.analyticsConfig,
    defaultLang: config?.defaultLanguage ?? "curl",
    featureFlagsConfig: {
      launchDarkly,
    },
  };

  // if the user specifies a github navbar link, grab the repo info from it and save it as an SWR fallback
  const githubNavbarLink = config?.navbarLinks?.find(
    (link) => link.type === "github"
  );
  if (githubNavbarLink) {
    const repo = getGitHubRepo(githubNavbarLink.url);
    if (repo) {
      const data = await getGitHubInfo(repo);
      if (data) {
        props.fallback[repo] = data;
      }
    }
  }

  // note: we start from the version node because endpoint Ids can be duplicated across versions
  // if we introduce versioned sections, and versioned api references, this logic will need to change
  // const apiReferenceNodes = FernNavigation.utils.collectApiReferences(
  //   found.currentVersion ?? found.node
  // );

  const FeedbackPopoverProvider = edgeFlags.isInlineFeedbackEnabled
    ? FeedbackPopover
    : React.Fragment;

  return (
    <NextApp pageProps={props}>
      <DocsPage>
        <ThemedDocs theme={props.theme}>
          <FeedbackPopoverProvider>
            <DocsMainContent
              domain={domain}
              rootslug={root.slug}
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
        </ThemedDocs>
      </DocsPage>
    </NextApp>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { slug?: string[] };
}): Promise<Metadata> {
  const domain = getDocsDomainApp();
  const slug = FernNavigation.slugjoin(params.slug);
  const docsLoader = await createCachedDocsLoader(domain);
  const findNode = createFindNode(docsLoader);
  const [files, node, config, isSeoDisabled] = await Promise.all([
    docsLoader.getFiles(),
    findNode(slug),
    docsLoader.getConfig(),
    getSeoDisabled(docsLoader.domain),
  ]);
  const pageId = node != null ? FernNavigation.getPageId(node) : undefined;
  const page = pageId ? await docsLoader.getPage(pageId) : undefined;
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
      icon: config?.favicon
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
  const page = await loader.getPage(pageId);
  if (page == null) {
    return null;
  }
  const { data: frontmatter } = getFrontmatter(page.markdown);
  return {
    slug: node.slug,
    title: node.title,
    excerpt: await serializeMdx(frontmatter.excerpt),
  };
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
