import { FernRegistry } from "@fern-fern/registry-browser";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import {
    assertIsUnversionedNavigationConfig,
    assertIsVersionedNavigationConfig,
    isUnversionedUntabbedNavigationConfig,
    type ResolvedUrlPath,
} from "@fern-ui/app-utils";
import { assertNever } from "@fern-ui/core-utils";
import { useEventCallback } from "@fern-ui/react-commons";
import { useTheme } from "@fern-ui/theme";
import { useRouter } from "next/router";
import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigationContext } from "../navigation-context/useNavigationContext";
import {
    DocsContext,
    DocsContextValue,
    type DocsInfo,
    type GetFullSlugOpts,
    type NavigateToPathOpts,
} from "./DocsContext";
import { useSlugListeners } from "./useSlugListeners";

function findTabIndexWithinTabbedNavigationConfig(
    config: FernRegistry.docs.v1.read.UnversionedNavigationConfig | undefined,
    tabSlug: string | undefined
) {
    if (config == null) {
        throw new Error("Could not find version config data.");
    }
    if (isUnversionedUntabbedNavigationConfig(config)) {
        return -1;
    } else {
        return config.tabs.findIndex((tab) => tab.urlSlug === tabSlug);
    }
}

export declare namespace DocsContextProvider {
    export type Props = PropsWithChildren<{
        docsDefinition: FernRegistryDocsRead.DocsDefinition;
        inferredVersionSlug: string | null;
        inferredTabIndex: number | null;
        resolvedUrlPath: ResolvedUrlPath;
        nextPath: ResolvedUrlPath | undefined;
        previousPath: ResolvedUrlPath | undefined;
    }>;
}

export const DocsContextProvider: React.FC<DocsContextProvider.Props> = ({
    docsDefinition,
    inferredVersionSlug,
    inferredTabIndex,
    resolvedUrlPath,
    nextPath,
    previousPath,
    children,
}) => {
    const router = useRouter();
    const { notifyIntentToGoBack, markBackNavigationAsComplete } = useNavigationContext();

    const [activeVersionSlug, _setActiveVersionSlug] = useState(inferredVersionSlug);
    const [activeTabIndex, setActiveTabIndex] = useState(inferredTabIndex);

    const versionSlug = activeVersionSlug ?? "";

    const docsInfo = useMemo<DocsInfo>(() => {
        if (inferredVersionSlug != null && activeVersionSlug != null) {
            assertIsVersionedNavigationConfig(docsDefinition.config.navigation);
            const configData = docsDefinition.config.navigation.versions
                .map((version, index) => ({ version, index }))
                .find(({ version }) => activeVersionSlug === version.urlSlug);
            if (configData == null) {
                throw new Error(
                    "Could not find the active navigation config. This is likely due to a bug in the application flow."
                );
            }
            return {
                type: "versioned",
                rootSlug: versionSlug,
                activeNavigationConfig: configData.version.config,
                activeVersionName: configData.version.version,
                activeVersionSlug,
                // TODO: The first version is not necessarily the default version
                isDefaultVersion: configData.index === 0,
                versions: docsDefinition.config.navigation.versions.map(({ version, urlSlug, availability }) => ({
                    versionName: version,
                    versionSlug: urlSlug,
                    availability,
                })),
            };
        } else {
            assertIsUnversionedNavigationConfig(docsDefinition.config.navigation);
            return {
                type: "unversioned",
                rootSlug: versionSlug,
                activeNavigationConfig: docsDefinition.config.navigation,
            };
        }
    }, [inferredVersionSlug, activeVersionSlug, docsDefinition.config.navigation, versionSlug]);

    const activeTab = useMemo(() => {
        if (activeTabIndex == null || isUnversionedUntabbedNavigationConfig(docsInfo.activeNavigationConfig)) {
            return undefined;
        }
        return docsInfo.activeNavigationConfig.tabs[activeTabIndex];
    }, [docsInfo.activeNavigationConfig, activeTabIndex]);

    const getFullSlug = useCallback(
        (slug: string, opts?: GetFullSlugOpts) => {
            const { omitVersionSlug = false, omitTabSlug = false } = opts ?? {};
            const parts: string[] = [];
            if (!omitVersionSlug && docsInfo.type === "versioned" && !docsInfo.isDefaultVersion && versionSlug) {
                parts.push(`${versionSlug}/`);
            }
            if (!omitTabSlug && activeTab != null) {
                parts.push(`${opts?.tabSlug ?? activeTab.urlSlug}/`);
            }
            parts.push(slug);
            return parts.join("");
        },
        [versionSlug, activeTab, docsInfo]
    );

    const selectedSlugFromUrl = useMemo(() => {
        switch (resolvedUrlPath.type) {
            case "clientLibraries":
            case "endpoint":
            case "webhook":
            case "mdx-page":
            case "topLevelEndpoint":
            case "topLevelWebhook":
            case "apiSubpackage":
                return getFullSlug(resolvedUrlPath.slug);
            case "api":
            case "section":
                return undefined;
            default:
                assertNever(resolvedUrlPath);
        }
    }, [resolvedUrlPath, getFullSlug]);

    const [selectedSlug, setSelectedSlug] = useState(selectedSlugFromUrl);

    const setActiveVersionSlug = useCallback((version: string) => {
        _setActiveVersionSlug(version);
    }, []);

    useEffect(() => {
        if (selectedSlug == null) {
            setSelectedSlug(selectedSlugFromUrl);
        }
    }, [selectedSlug, selectedSlugFromUrl]);

    const resolveApi = useCallback(
        (apiId: FernRegistry.ApiDefinitionId): FernRegistryApiRead.ApiDefinition => {
            const api = docsDefinition.apis[apiId];
            if (api == null) {
                throw new Error("API does not exist: " + apiId);
            }
            return api;
        },
        [docsDefinition.apis]
    );

    const resolvePage = useCallback(
        (pageId: FernRegistryDocsRead.PageId): FernRegistryDocsRead.PageContent => {
            const page = docsDefinition.pages[pageId];
            if (page == null) {
                throw new Error("Page does not exist: " + pageId);
            }
            return page;
        },
        [docsDefinition.pages]
    );

    const resolveFile = useCallback(
        (fileId: FernRegistryDocsRead.FileId): FernRegistryDocsRead.Url => {
            const file = docsDefinition.files[fileId];
            if (file == null) {
                throw new Error("File does not exist: " + fileId);
            }
            return file;
        },
        [docsDefinition.files]
    );

    const navigateToPathListeners = useSlugListeners("navigateToPath", { selectedSlug });

    const [justNavigated, setJustNavigated] = useState(false);

    const inferTabIndexFromSlug = useCallback(
        (fullSlug: string) => {
            const [firstPart, secondPart] = fullSlug.split("/");
            if (docsInfo.type === "versioned") {
                assertIsVersionedNavigationConfig(docsDefinition.config.navigation);
                // The first part of the slug may refer to a version
                const versionMatchingSlugFirstPart = docsInfo.versions
                    .map((v, versionIndex) => ({
                        ...v,
                        versionIndex,
                    }))
                    .find((v) => v.versionSlug === firstPart);
                if (versionMatchingSlugFirstPart != null) {
                    // We found a version that matches the first part of the slug
                    const { versionIndex } = versionMatchingSlugFirstPart;
                    const versionConfigData = docsDefinition.config.navigation.versions[versionIndex];
                    if (versionConfigData == null) {
                        throw new Error("Could not find version config data.");
                    }
                    const isDefaultVersion = versionIndex === 0;
                    if (!isDefaultVersion) {
                        // The user wants to navigate to a page within this version
                        const tabSlug = secondPart;
                        return findTabIndexWithinTabbedNavigationConfig(versionConfigData.config, tabSlug);
                    } else {
                        if (isUnversionedUntabbedNavigationConfig(versionConfigData.config)) {
                            return -1;
                        } else {
                            // TODO: See if there is a tab within this version that has the same slug as version
                            const tabSlug = secondPart;
                            return findTabIndexWithinTabbedNavigationConfig(versionConfigData.config, tabSlug);
                        }
                    }
                } else {
                    // We could not find a version that matches the first part of the slug. We assume that
                    // the user wants to navigate to a page within the default version.
                    const tabSlug = firstPart;
                    const defaultVersionConfigData = docsDefinition.config.navigation.versions[0];
                    return findTabIndexWithinTabbedNavigationConfig(defaultVersionConfigData?.config, tabSlug);
                }
            } else {
                // The first part of the slug refers to a tab
                assertIsUnversionedNavigationConfig(docsDefinition.config.navigation);
                const tabSlug = firstPart;
                return findTabIndexWithinTabbedNavigationConfig(docsDefinition.config.navigation, tabSlug);
            }
        },
        [docsInfo, docsDefinition.config.navigation]
    );

    const navigateToPath = useEventCallback((slugWithoutVersion: string, opts?: NavigateToPathOpts) => {
        setJustNavigated(true);
        const slug = getFullSlug(slugWithoutVersion, opts);
        setSelectedSlug(slug);
        // Figure out which tab we're navigating to and set the active index
        const tabIndex = inferTabIndexFromSlug(slug);
        if (tabIndex !== -1) {
            setActiveTabIndex(tabIndex);
        } else {
            // eslint-disable-next-line no-console
            console.warn(
                `Could not find the tab index corresponding to the slug "${slug}". This may be due to bad user input or a bug in the application.`
            );
        }

        navigateToPathListeners.invokeListeners(slug);
        const timeout = setTimeout(() => {
            setJustNavigated(false);
        }, 500);
        return () => {
            clearTimeout(timeout);
        };
    });

    useEffect(() => {
        router.beforePopState(({ as }) => {
            notifyIntentToGoBack();
            const slug = as.substring(1, as.length);
            if (slug.length > 0) {
                navigateToPath(slug, { omitTabSlug: true, omitVersionSlug: true });
                const fullSlug = getFullSlug(slug);
                void router.replace(`/${fullSlug}`, undefined, { shallow: true, scroll: false }).then(() => {
                    markBackNavigationAsComplete();
                });
            }
            return true;
        });
    }, [router, navigateToPath, notifyIntentToGoBack, markBackNavigationAsComplete, getFullSlug]);

    const scrollToPathListeners = useSlugListeners("scrollToPath", { selectedSlug });

    const onScrollToPath = useEventCallback((slugWithoutVersion: string) => {
        const slug = getFullSlug(slugWithoutVersion);
        if (justNavigated || slug === selectedSlug) {
            return;
        }
        setSelectedSlug(slug);
        void router.replace(`/${slug}`, undefined, { shallow: true, scroll: false });
        scrollToPathListeners.invokeListeners(slug);
    });

    const { theme, setTheme } = useTheme(docsDefinition.config.colorsV3.type);

    const contextValue = useCallback(
        (): DocsContextValue => ({
            resolveApi,
            resolvePage,
            resolveFile,
            docsDefinition,
            docsInfo,
            setActiveVersionSlug,
            activeTab,
            activeTabIndex,
            getFullSlug,
            registerNavigateToPathListener: navigateToPathListeners.registerListener,
            navigateToPath,
            onScrollToPath,
            registerScrolledToPathListener: scrollToPathListeners.registerListener,
            resolvedPathFromUrl: resolvedUrlPath,
            nextPath,
            previousPath,
            selectedSlug,
            theme,
            setTheme,
        }),
        [
            docsDefinition,
            docsInfo,
            setActiveVersionSlug,
            activeTab,
            activeTabIndex,
            getFullSlug,
            navigateToPath,
            navigateToPathListeners.registerListener,
            nextPath,
            onScrollToPath,
            previousPath,
            resolveApi,
            resolveFile,
            resolvePage,
            resolvedUrlPath,
            scrollToPathListeners.registerListener,
            selectedSlug,
            theme,
            setTheme,
        ]
    );

    return <DocsContext.Provider value={contextValue}>{children}</DocsContext.Provider>;
};
