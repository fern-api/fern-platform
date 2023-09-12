import * as FernRegistryDocsReadV1 from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import * as FernRegistryDocsReadV2 from "@fern-fern/registry-browser/api/resources/docs/resources/v2/resources/read";
import {
    getSlugFromUrl,
    isUnversionedTabbedNavigationConfig,
    isVersionedNavigationConfig,
    UrlPathResolver,
    type ResolvedUrlPath,
} from "@fern-ui/app-utils";
import { assertNeverNoThrow } from "@fern-ui/core-utils";
import { App } from "@fern-ui/ui";
import { GetStaticPaths, GetStaticProps } from "next";
import { Inter } from "next/font/google";
import Head from "next/head";
import { REGISTRY_SERVICE } from "../../service";
import { loadDocsBackgroundImage } from "../../utils/theme/loadDocsBackgroundImage";
import { generateFontFaces, loadDocTypography } from "../../utils/theme/loadDocsTypography";

function classNames(...classes: (string | undefined)[]): string {
    return classes.filter((c) => c != null).join(" ");
}

const inter = Inter({ subsets: ["latin"] });

export declare namespace Docs {
    export interface Props {
        docs: FernRegistryDocsReadV2.LoadDocsForUrlResponse;
        /**
         * If `null`, then docs are not versioned.
         */
        inferredVersionSlug: string | null;
        inferredTabIndex: number | null;
        resolvedUrlPath: ResolvedUrlPath;
        typographyStyleSheet?: string;
        backgroundImageStyleSheet: string | null;
        nextPath: ResolvedUrlPath | null;
        previousPath: ResolvedUrlPath | null;
    }
}

export default function Docs({
    docs,
    inferredVersionSlug,
    inferredTabIndex,
    typographyStyleSheet = "",
    backgroundImageStyleSheet = "",
    resolvedUrlPath,
    nextPath,
    previousPath,
}: Docs.Props): JSX.Element {
    return (
        <>
            <main className={classNames(inter.className, "typography-font-body")}>
                {/* 
                    We concatenate all global styles into a single instance,
                    as styled JSX will only create one instance of global styles
                    for each component.
                */}
                {/* eslint-disable-next-line react/no-unknown-property */}
                <style jsx global>
                    {`
                        ${typographyStyleSheet}
                        ${backgroundImageStyleSheet}
                    `}
                </style>
                <Head>
                    {docs.definition.config.title != null && <title>{docs.definition.config.title}</title>}
                    {docs.definition.config.favicon != null && (
                        <link rel="icon" id="favicon" href={docs.definition.files[docs.definition.config.favicon]} />
                    )}
                </Head>
                <App
                    docs={docs}
                    inferredVersionSlug={inferredVersionSlug}
                    inferredTabIndex={inferredTabIndex}
                    resolvedUrlPath={resolvedUrlPath}
                    nextPath={nextPath ?? undefined}
                    previousPath={previousPath ?? undefined}
                />
            </main>
        </>
    );
}

export const getStaticProps: GetStaticProps<Docs.Props> = async ({ params = {} }) => {
    const host = params.host as string | undefined;
    const slugArray = params.slug as string[] | undefined;

    if (host == null) {
        throw new Error("host is not defined");
    }

    const pathname = slugArray != null ? slugArray.join("/") : "";
    const docs = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({
        url: process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? buildUrl({ host, pathname }),
    });

    if (!docs.ok) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch docs", docs.error);
        return {
            notFound: true,
            revalidate: false,
        };
    }

    const computeResponseForNavigationItems = async (
        items: FernRegistryDocsReadV1.NavigationItem[],
        slugAfterTabSlug: string
    ): Promise<ComputeResponseForNavigationItemsReturnType> => {
        const urlPathResolver = new UrlPathResolver({
            items,
            loadApiDefinition: (id) => docs.body.definition.apis[id],
            loadApiPage: (id) => docs.body.definition.pages[id],
        });
        let resolvedUrlPath = await urlPathResolver.resolveSlug(slugAfterTabSlug);
        if (resolvedUrlPath?.type === "section") {
            const firstNavigatableItem = getFirstNavigatableItem(resolvedUrlPath.section);
            if (firstNavigatableItem == null) {
                resolvedUrlPath = undefined;
            } else {
                resolvedUrlPath = await urlPathResolver.resolveSlug(firstNavigatableItem);
            }
        }

        if (resolvedUrlPath == null) {
            return { success: false };
        }

        const typographyConfig = loadDocTypography(docs.body.definition);
        const typographyStyleSheet = generateFontFaces(typographyConfig);
        const backgroundImageStyleSheet = loadDocsBackgroundImage(docs.body.definition);
        const [nextPath, previousPath] = await Promise.all([
            urlPathResolver.getNextNavigatableItem(resolvedUrlPath),
            urlPathResolver.getPreviousNavigatableItem(resolvedUrlPath),
        ]);

        return {
            success: true,
            props: {
                docs: docs.body,
                inferredVersionSlug: null,
                typographyStyleSheet,
                backgroundImageStyleSheet: backgroundImageStyleSheet ?? null,
                resolvedUrlPath,
                nextPath: nextPath ?? null,
                previousPath: previousPath ?? null,
            },
        };
    };

    let slug = getSlugFromUrl({ pathname, basePath: docs.body.baseUrl.basePath });

    const { navigation: navigationConfig } = docs.body.definition.config;

    if (isVersionedNavigationConfig(navigationConfig)) {
        // TODO: The first element of the array is not necessarily the default/latest api version
        const [defaultVersionConfigData] = navigationConfig.versions;
        if (defaultVersionConfigData == null) {
            throw new Error("No versions found. This indicates a registration issue.");
        }

        if (slug === "") {
            if (isUnversionedTabbedNavigationConfig(defaultVersionConfigData.config)) {
                // TODO: Implement
                throw new Error("Not supporting tabs yet.");
            } else {
                const [firstNavigationItem] = defaultVersionConfigData.config.items;
                if (firstNavigationItem != null) {
                    slug = firstNavigationItem.urlSlug;

                    const urlPathResolver = new UrlPathResolver({
                        items: defaultVersionConfigData.config.items,
                        loadApiDefinition: (id) => docs.body.definition.apis[id],
                        loadApiPage: (id) => docs.body.definition.pages[id],
                    });

                    let resolvedUrlPath = await urlPathResolver.resolveSlug(slug);
                    if (resolvedUrlPath?.type === "section") {
                        const firstNavigatableItem = getFirstNavigatableItem(resolvedUrlPath.section);
                        if (firstNavigatableItem == null) {
                            resolvedUrlPath = undefined;
                        } else {
                            resolvedUrlPath = await urlPathResolver.resolveSlug(firstNavigatableItem);
                        }
                    }

                    if (resolvedUrlPath == null) {
                        return { notFound: true, revalidate: false };
                    }

                    const typographyConfig = loadDocTypography(docs.body.definition);
                    const typographyStyleSheet = generateFontFaces(typographyConfig);
                    const backgroundImageStyleSheet = loadDocsBackgroundImage(docs.body.definition);
                    const [nextPath, previousPath] = await Promise.all([
                        urlPathResolver.getNextNavigatableItem(resolvedUrlPath),
                        urlPathResolver.getPreviousNavigatableItem(resolvedUrlPath),
                    ]);

                    return {
                        props: {
                            docs: docs.body,
                            inferredVersionSlug: defaultVersionConfigData.version,
                            inferredTabIndex: null, // TODO: Implement
                            typographyStyleSheet,
                            backgroundImageStyleSheet: backgroundImageStyleSheet ?? null,
                            resolvedUrlPath,
                            nextPath: nextPath ?? null,
                            previousPath: previousPath ?? null,
                        },
                        revalidate: false,
                    };
                } else {
                    return { notFound: true, revalidate: false };
                }
            }
        } else {
            const { version: versionCandidate, rest } = extractVersionFromSlug(slug);
            const versionMatchingSlug = navigationConfig.versions.find((v) => v.version === versionCandidate);

            let version: string | undefined;

            if (versionMatchingSlug != null) {
                // Assume that the first part of the slug refers to a version
                version = versionMatchingSlug.version;
                slug = rest;
            } else {
                // Assume that the request is for the default version
                version = defaultVersionConfigData.version;
            }

            // Find the version in docs definition
            const configData = navigationConfig.versions.find((c) => c.version === version);
            if (configData == null) {
                return { notFound: true, revalidate: false };
            }

            if (slug === "") {
                if (isUnversionedTabbedNavigationConfig(configData.config)) {
                    // TODO: Implement
                    throw new Error("Not supporting tabs yet.");
                } else {
                    const [firstNavigationItem] = configData.config.items;
                    if (firstNavigationItem != null) {
                        slug = firstNavigationItem.urlSlug;
                    } else {
                        return { notFound: true, revalidate: false };
                    }
                }
            }

            if (isUnversionedTabbedNavigationConfig(configData.config)) {
                throw new Error("Not supporting tabs yet");
            } else {
                const urlPathResolver = new UrlPathResolver({
                    items: configData.config.items,
                    loadApiDefinition: (id) => docs.body.definition.apis[id],
                    loadApiPage: (id) => docs.body.definition.pages[id],
                });

                let resolvedUrlPath = await urlPathResolver.resolveSlug(slug);
                if (resolvedUrlPath?.type === "section") {
                    const firstNavigatableItem = getFirstNavigatableItem(resolvedUrlPath.section);
                    if (firstNavigatableItem == null) {
                        resolvedUrlPath = undefined;
                    } else {
                        resolvedUrlPath = await urlPathResolver.resolveSlug(firstNavigatableItem);
                    }
                }

                if (resolvedUrlPath == null) {
                    return { notFound: true, revalidate: false };
                }

                const typographyConfig = loadDocTypography(docs.body.definition);
                const typographyStyleSheet = generateFontFaces(typographyConfig);
                const backgroundImageStyleSheet = loadDocsBackgroundImage(docs.body.definition);
                const [nextPath, previousPath] = await Promise.all([
                    urlPathResolver.getNextNavigatableItem(resolvedUrlPath),
                    urlPathResolver.getPreviousNavigatableItem(resolvedUrlPath),
                ]);

                return {
                    props: {
                        docs: docs.body,
                        inferredVersionSlug: version,
                        inferredTabIndex: null, // TODO: Implement
                        typographyStyleSheet,
                        backgroundImageStyleSheet: backgroundImageStyleSheet ?? null,
                        resolvedUrlPath,
                        nextPath: nextPath ?? null,
                        previousPath: previousPath ?? null,
                    },
                    revalidate: false,
                };
            }
        }
    } else {
        if (slug === "") {
            if (isUnversionedTabbedNavigationConfig(navigationConfig)) {
                const [firstTab] = navigationConfig.tabs;
                if (firstTab == null) {
                    return { notFound: true, revalidate: false };
                }
                const [firstNavigationItem] = firstTab.items;
                if (firstNavigationItem != null) {
                    slug = [firstTab.urlSlug, firstNavigationItem.urlSlug].join("/");
                } else {
                    return { notFound: true, revalidate: false };
                }
            } else {
                const [firstNavigationItem] = navigationConfig.items;
                if (firstNavigationItem != null) {
                    slug = firstNavigationItem.urlSlug;
                } else {
                    return { notFound: true, revalidate: false };
                }
            }
        }

        if (isUnversionedTabbedNavigationConfig(navigationConfig)) {
            const [tabUrlSlug, ...rest] = slug.split("/");
            slug = rest.join("/");
            const tabInfo = navigationConfig.tabs
                .map((tab, index) => ({ tab, index }))
                .find(({ tab }) => tab.urlSlug === tabUrlSlug);
            if (tabInfo == null) {
                return { notFound: true, revalidate: false };
            }
            const { tab, index: tabIndex } = tabInfo;
            const resp = await computeResponseForNavigationItems(tab.items, slug);
            return {
                revalidate: false,
                ...(resp.success ? { props: { ...resp.props, inferredTabIndex: tabIndex } } : { notFound: true }),
            };
        } else {
            const resp = await computeResponseForNavigationItems(navigationConfig.items, slug);
            return {
                revalidate: false,
                ...(resp.success ? { props: { ...resp.props, inferredTabIndex: null } } : { notFound: true }),
            };
        }
    }
};

type ComputeResponseForNavigationItemsReturnType =
    | {
          success: true;
          props: Omit<Docs.Props, "inferredTabIndex">;
      }
    | {
          success: false;
      };

export const getStaticPaths: GetStaticPaths = () => {
    return { paths: [], fallback: "blocking" };
};

function getFirstNavigatableItem(section: FernRegistryDocsReadV1.DocsSection, slugPrefix?: string): string | undefined {
    for (const item of section.items) {
        switch (item.type) {
            case "api":
            case "page": {
                const parts = [];
                if (slugPrefix != null) {
                    parts.push(slugPrefix);
                }
                parts.push(section.urlSlug, item.urlSlug);
                return parts.join("/");
            }
            case "section":
                return getFirstNavigatableItem(item, section.urlSlug);
            default:
                assertNeverNoThrow(item);
        }
    }
    return undefined;
}

function buildUrl({ host, pathname }: { host: string; pathname: string }): string {
    const hostWithoutTrailingSlash = host.endsWith("/") ? host.slice(0, -1) : host;
    if (pathname.length === 0) {
        return hostWithoutTrailingSlash;
    }
    return `${hostWithoutTrailingSlash}/${pathname}`;
}

function extractVersionFromSlug(slug: string) {
    const [version, ...rest] = slug.split("/");
    return { version, rest: rest.join("/") };
}
