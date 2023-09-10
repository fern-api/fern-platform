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
        inferredVersion: string | null;
        resolvedUrlPath: ResolvedUrlPath;
        typographyStyleSheet?: string;
        backgroundImageStyleSheet: string | null;
        nextPath: ResolvedUrlPath | null;
        previousPath: ResolvedUrlPath | null;
    }
}

export default function Docs({
    docs,
    inferredVersion,
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
                    inferredVersion={inferredVersion}
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
        slug: string
    ): Promise<ComputeResponseForNavigationItemsReturnType> => {
        const urlPathResolver = new UrlPathResolver({
            items,
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
            return {
                success: false,
                response: {
                    notFound: true,
                    revalidate: false,
                },
            };
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
            response: {
                props: {
                    docs: docs.body,
                    inferredVersion: null,
                    typographyStyleSheet,
                    backgroundImageStyleSheet: backgroundImageStyleSheet ?? null,
                    resolvedUrlPath,
                    nextPath: nextPath ?? null,
                    previousPath: previousPath ?? null,
                },
                revalidate: false,
            },
        };
    };

    let slug = getSlugFromUrl({ pathname, basePath: docs.body.baseUrl.basePath });

    const { navigation: navigationConfig } = docs.body.definition.config;

    if (isVersionedNavigationConfig(navigationConfig)) {
        if (slug === "") {
            // TODO: The first element of the array is not necessarily the latest api version
            const [latestVersion] = navigationConfig.versions;
            if (latestVersion == null) {
                throw new Error("No versions found. This indicates a registration issue.");
            }

            if (isUnversionedTabbedNavigationConfig(latestVersion.config)) {
                // TODO: Implement
                throw new Error("Not supporting tabs yet.");
            } else {
                const [firstNavigationItem] = latestVersion.config.items;
                if (firstNavigationItem != null) {
                    slug = firstNavigationItem.urlSlug;

                    const urlPathResolver = new UrlPathResolver({
                        items: latestVersion.config.items,
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
                            inferredVersion: latestVersion.version,
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
            // The slug must contain the version. If not, return not found

            const { version, rest } = extractVersionFromSlug(slug);
            if (version == null || version.length === 0) {
                return { notFound: true, revalidate: false };
            }
            slug = rest;

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
                        inferredVersion: version,
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
                    slug = firstNavigationItem.urlSlug;
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
            const tab = navigationConfig.tabs.find((tab) => tab.urlSlug === tabUrlSlug);
            if (tab == null) {
                return { notFound: true, revalidate: false };
            }
            const resp = await computeResponseForNavigationItems(tab.items, slug);
            return resp.success ? resp.response : resp.response; // TS limitation
        } else {
            const resp = await computeResponseForNavigationItems(navigationConfig.items, slug);
            return resp.success ? resp.response : resp.response; // TS limitation
        }
    }
};

type ComputeResponseForNavigationItemsReturnType =
    | {
          success: true;
          response: {
              props: Docs.Props;
              revalidate: false | undefined;
          };
      }
    | {
          success: false;
          response: {
              notFound: true;
              revalidate: false | undefined;
          };
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
