import { FernDocs } from "@fern-api/fdr-sdk";
import {
  ApiDefinition,
  CodeSnippet,
  convertToCurl,
  EndpointDefinition,
  ExampleEndpointCall,
  toSnippetHttpRequest,
  Transformer,
} from "@fern-api/fdr-sdk/api-definition";
import {
  APIV1Read,
  FdrAPI,
  type DocsV2Read,
} from "@fern-api/fdr-sdk/client/types";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { getFrontmatter } from "@fern-docs/mdx";
import { withSeo } from "@fern-docs/seo";
import {
  DocsContent,
  DocsPage,
  getGitHubInfo,
  getGitHubRepo,
  ImageData,
  NavbarLink,
  renderThemeStylesheet,
  resolveDocsContent,
  withCustomJavascript,
  withLogo,
} from "@fern-docs/ui";
import { serializeMdx } from "@fern-docs/ui/bundlers/next-mdx-remote";
import {
  DEFAULT_EDGE_FLAGS,
  EdgeFlags,
  getRedirectForPath,
} from "@fern-docs/utils";
import { SidebarTab } from "@fern-platform/fdr-utils";
import type { GetServerSidePropsResult } from "next";
import { ComponentProps } from "react";
import { UnreachableCaseError } from "ts-essentials";
import urljoin from "url-join";

export async function getDocsPageProps(
  docs: DocsV2Read.LoadDocsForUrlResponse,
  slugArray: string[]
): Promise<GetServerSidePropsResult<ComponentProps<typeof DocsPage>>> {
  // HACKHACK: temporarily disable endpoint pairs for cohere in local preview
  const root = FernNavigation.utils.toRootNode(
    docs,
    docs.baseUrl.domain.includes("cohere")
  );
  const slug = FernNavigation.slugjoin(...slugArray);

  // compute manual redirects
  const redirect = getRedirectForPath(
    `/${slug}`,
    docs.baseUrl,
    docs.definition.config.redirects
  );
  if (redirect != null) {
    return redirect;
  }

  // if the root has a slug and the current slug is empty, redirect to the root slug, rather than 404
  if (root.slug.length > 0 && slug.length === 0) {
    return {
      redirect: {
        destination: encodeURI(urljoin("/", root.slug)),
        permanent: false,
      },
    };
  }

  const node = FernNavigation.utils.findNode(root, slug);

  // in local preview, always render 404 page if the node is not found
  if (node.type === "notFound") {
    return { notFound: true };
  }

  if (node.type === "redirect") {
    return {
      redirect: {
        destination: encodeURI(urljoin("/", node.redirect)),
        permanent: false,
      },
    };
  }

  // TODO: get feature flags from the API
  const edgeFlags: EdgeFlags = DEFAULT_EDGE_FLAGS;

  function resolveFileSrc(src: string | undefined): ImageData | undefined {
    if (src == null) {
      return undefined;
    }

    const fileId = FernNavigation.FileId(
      src.startsWith("file:") ? src.slice(5) : src
    );
    const file = docs.definition.filesV2[fileId];
    if (file == null) {
      // the file is not found, so we return the src as the image data
      return { src };
    }

    if (file.type === "image") {
      return {
        src: file.url,
        width: file.width,
        height: file.height,
        blurDataURL: file.blurDataUrl,
      };
    } else if (file.type === "url") {
      return { src: file.url };
    } else {
      throw new UnreachableCaseError(file);
    }
  }

  const content = await resolveDocsContent({
    domain: docs.baseUrl.domain,
    node: node.node,
    version: node.currentVersion ?? root,
    apiReference: node.apiReference,
    parents: node.parents,
    breadcrumb: node.breadcrumb,
    prev: node.prev,
    next: node.next,
    apis: docs.definition.apis,
    apisV2:
      docs.definition.apisV2 != null
        ? Object.fromEntries(
            await Promise.all(
              Object.values(docs.definition.apisV2).map(async (api) => {
                const resolved = await resolveHttpCodeSnippets(api);
                return [api.id, resolved] as const;
              })
            )
          )
        : {},
    pages: docs.definition.pages,
    edgeFlags,
    mdxOptions: {
      files: docs.definition.jsFiles,
      scope: {
        env: "development",
        authed: false,
        user: undefined,
        version: node.currentVersion?.versionId,
        tab: node.currentTab?.title,
      },

      // inject the file url and dimensions for images and other embeddable files
      replaceSrc: resolveFileSrc,
    },
    serializeMdx,
    engine: "next-mdx-remote",
  });

  const frontmatter = extractFrontmatterFromDocsContent(node.node.id, content);

  if (content == null) {
    console.error(`Failed to resolve path for ${slug}`);
    return { notFound: true };
  }

  const colors = {
    light:
      docs.definition.config.colorsV3?.type === "light"
        ? docs.definition.config.colorsV3
        : docs.definition.config.colorsV3?.type === "darkAndLight"
          ? docs.definition.config.colorsV3.light
          : undefined,
    dark:
      docs.definition.config.colorsV3?.type === "dark"
        ? docs.definition.config.colorsV3
        : docs.definition.config.colorsV3?.type === "darkAndLight"
          ? docs.definition.config.colorsV3.dark
          : undefined,
  };

  const versions = node.versions
    .filter((version) => !version.hidden)
    .map((version, index) => {
      // if the same page exists in multiple versions, return the full slug of that page, otherwise default to version's landing page (pointsTo)
      const expectedSlug = FernNavigation.slugjoin(
        version.slug,
        node.unversionedSlug
      );
      const pointsTo = node.collector.slugMap.has(expectedSlug)
        ? expectedSlug
        : version.pointsTo;

      return {
        title: version.title,
        id: version.versionId,
        slug: version.slug,
        pointsTo,
        index,
        availability: version.availability,
        hidden: version.hidden,
        authed: version.authed,
      };
    });

  const navbarLinks: NavbarLink[] = [];

  docs.definition.config.navbarLinks?.forEach((link) => {
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

  const props: ComponentProps<typeof DocsPage> = {
    baseUrl: docs.baseUrl,
    layout: docs.definition.config.layout,
    title: docs.definition.config.title,
    favicon: docs.definition.config.favicon,
    colors,
    js: withCustomJavascript(docs.definition.config.js, resolveFileSrc),
    navbarLinks,
    logo: withLogo(docs.definition, node, frontmatter, resolveFileSrc),
    content,
    announcement:
      docs.definition.config.announcement != null
        ? {
            mdx: await serializeMdx(docs.definition.config.announcement.text),
            text: docs.definition.config.announcement.text,
          }
        : undefined,
    navigation: {
      currentTabIndex:
        node.currentTab == null
          ? undefined
          : node.tabs.indexOf(node.currentTab),
      tabs: node.tabs.map((tab, index) =>
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
      ),
      currentVersionId: node.currentVersion?.versionId,
      versions,
      sidebar: node.sidebar,
      trailingSlash: false,
    },
    edgeFlags,
    apis: Object.keys(docs.definition.apis).map(FdrAPI.ApiDefinitionId),
    seo: withSeo(
      docs.baseUrl.domain,
      docs.definition.config,
      frontmatter,
      docs.definition.filesV2,
      docs.definition.apis,
      node,
      true
    ),
    fallback: {},
    analytics: undefined,
    analyticsConfig: docs.definition.config.analyticsConfig,
    theme: docs.baseUrl.domain.includes("cohere") ? "cohere" : "default",
    user: undefined,
    defaultLang: docs.definition.config.defaultLanguage ?? "curl",
    stylesheet: renderThemeStylesheet(
      colors,
      docs.definition.config.typographyV2,
      docs.definition.config.layout,
      docs.definition.config.css,
      docs.definition.filesV2,
      node.tabs.length > 0
    ),
    featureFlagsConfig: undefined,
  };

  // if the user specifies a github navbar link, grab the repo info from it and save it as an SWR fallback
  const githubNavbarLink = docs.definition.config.navbarLinks?.find(
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

  return { props };
}

// TODO: actually need to add http examples here
const resolveHttpCodeSnippets = async (
  apiDefinition: ApiDefinition
): Promise<ApiDefinition> => {
  // Collect all endpoints first, so that we can resolve descriptions in a single batch
  const collected: EndpointDefinition[] = [];
  Transformer.with({
    EndpointDefinition: (endpoint) => {
      collected.push(endpoint);
      return endpoint;
    },
  }).apiDefinition(apiDefinition);

  // Resolve example code snippets in parallel
  const result = Object.fromEntries(
    await Promise.all(
      collected.map(async (endpoint) => {
        if (endpoint.examples == null || endpoint.examples.length === 0) {
          return [endpoint.id, endpoint] as const;
        }

        const examples = await Promise.all(
          endpoint.examples.map((example) =>
            resolveExample(apiDefinition, endpoint, example)
          )
        );

        return [endpoint.id, { ...endpoint, examples }] as const;
      })
    )
  );

  // reduce the api definition with newly resolved examples
  return {
    ...apiDefinition,
    endpoints: { ...apiDefinition.endpoints, ...result },
  };
};

const resolveExample = async (
  apiDefinition: ApiDefinition,
  endpoint: EndpointDefinition,
  example: ExampleEndpointCall
): Promise<ExampleEndpointCall> => {
  const snippets = { ...example.snippets };

  const pushSnippet = (snippet: CodeSnippet) => {
    (snippets[snippet.language] ??= []).push(snippet);
  };

  // Check if curl snippet exists
  if (!snippets[APIV1Read.SupportedLanguage.Curl]?.length) {
    const endpointAuth = endpoint.auth?.[0];
    const curlCode = convertToCurl(
      toSnippetHttpRequest(
        endpoint,
        example,
        endpointAuth != null ? apiDefinition.auths[endpointAuth] : undefined
      ),
      {
        usesApplicationJsonInFormDataValue: false,
      }
    );
    pushSnippet({
      name: undefined,
      language: APIV1Read.SupportedLanguage.Curl,
      install: undefined,
      code: curlCode,
      generated: true,
      description: undefined,
    });
  }

  return { ...example, snippets };
};

export function extractFrontmatterFromDocsContent(
  nodeId: FernNavigation.NodeId,
  docsContent: DocsContent | undefined
): FernDocs.Frontmatter | undefined {
  if (docsContent == null) {
    return undefined;
  }
  switch (docsContent.type) {
    case "markdown-page":
      return getFrontmatterFromMarkdownText(docsContent.content);
    case "changelog-entry":
      return getFrontmatterFromMarkdownText(docsContent.page);
    case "api-reference-page": {
      const mdx = docsContent.mdxs[nodeId];
      if (mdx == null) {
        return undefined;
      }
      return getFrontmatterFromMarkdownText(mdx.content);
    }
    default:
      // TODO: handle changelog overview page and other pages
      return undefined;
  }
}

function getFrontmatterFromMarkdownText(
  markdownText: FernDocs.MarkdownText
): FernDocs.Frontmatter | undefined {
  if (typeof markdownText === "string") {
    return getFrontmatter(markdownText).data;
  }
  return markdownText.frontmatter;
}
