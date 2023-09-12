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
import { useRouter } from "next/router";
import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react";
import { DocsContext, DocsContextValue, type DocsInfo, type NavigateToPathOpts } from "./DocsContext";
import { useSlugListeners } from "./useSlugListeners";

export declare namespace DocsContextProvider {
    export type Props = PropsWithChildren<{
        docsDefinition: FernRegistryDocsRead.DocsDefinition;
        lightModeEnabled: boolean;
        inferredVersion: string | null;
        inferredTabIndex: number | null;
        resolvedUrlPath: ResolvedUrlPath;
        nextPath: ResolvedUrlPath | undefined;
        previousPath: ResolvedUrlPath | undefined;
    }>;
}

export const DocsContextProvider: React.FC<DocsContextProvider.Props> = ({
    docsDefinition,
    lightModeEnabled,
    inferredVersion,
    inferredTabIndex,
    resolvedUrlPath,
    nextPath,
    previousPath,
    children,
}) => {
    const router = useRouter();

    const [activeVersion, _setActiveVersion] = useState(inferredVersion);
    const [activeTabIndex, _setActiveTabIndex] = useState(inferredTabIndex);

    const versionSlug = activeVersion ?? "";

    const docsInfo = useMemo<DocsInfo>(() => {
        if (inferredVersion != null && activeVersion != null) {
            assertIsVersionedNavigationConfig(docsDefinition.config.navigation);
            const configData = docsDefinition.config.navigation.versions
                .map((version, index) => ({ version, index }))
                .find(({ version }) => activeVersion === version.version);
            if (configData == null) {
                throw new Error(
                    "Could not find the active navigation config. This is likely due to a bug in the application flow."
                );
            }
            return {
                type: "versioned",
                rootSlug: versionSlug,
                activeNavigationConfig: configData.version.config,
                activeVersion,
                // TODO: The first version is not necessarily the default version
                isDefaultVersion: configData.index === 0,
                versions: docsDefinition.config.navigation.versions.map(({ version }) => version),
            };
        } else {
            assertIsUnversionedNavigationConfig(docsDefinition.config.navigation);
            return {
                type: "unversioned",
                rootSlug: versionSlug,
                activeNavigationConfig: docsDefinition.config.navigation,
            };
        }
    }, [inferredVersion, activeVersion, docsDefinition.config.navigation, versionSlug]);

    const activeTab = useMemo(() => {
        if (activeTabIndex == null || isUnversionedUntabbedNavigationConfig(docsInfo.activeNavigationConfig)) {
            return undefined;
        }
        return docsInfo.activeNavigationConfig.tabs[activeTabIndex];
    }, [docsInfo.activeNavigationConfig, activeTabIndex]);

    const getFullSlug = useCallback(
        (slug: string, opts?: { tabSlug?: string }) => {
            const parts: string[] = [];
            if (docsInfo.type === "versioned" && !docsInfo.isDefaultVersion && versionSlug) {
                parts.push(`${versionSlug}/`);
            }
            if (activeTab != null) {
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

    const setActiveVersion = useCallback((version: string) => {
        _setActiveVersion(version);
    }, []);

    const setActiveTabIndex = useCallback((tabIndex: number) => {
        _setActiveTabIndex(tabIndex);
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

    const navigateToPath = useEventCallback(
        (slugWithoutVersion: string, opts: NavigateToPathOpts = { omitVersionPrefix: false }) => {
            setJustNavigated(true);
            const slug = opts.omitVersionPrefix
                ? slugWithoutVersion
                : getFullSlug(slugWithoutVersion, { tabSlug: opts.tabSlug });
            setSelectedSlug(slug);
            navigateToPathListeners.invokeListeners(slug);

            const timeout = setTimeout(() => {
                setJustNavigated(false);
            }, 500);
            return () => {
                clearTimeout(timeout);
            };
        }
    );

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

    const contextValue = useCallback(
        (): DocsContextValue => ({
            resolveApi,
            resolvePage,
            resolveFile,
            docsDefinition,
            lightModeEnabled,
            docsInfo,
            setActiveVersion,
            activeTab,
            activeTabIndex,
            setActiveTabIndex,
            getFullSlug,
            registerNavigateToPathListener: navigateToPathListeners.registerListener,
            navigateToPath,
            onScrollToPath,
            registerScrolledToPathListener: scrollToPathListeners.registerListener,
            resolvedPathFromUrl: resolvedUrlPath,
            nextPath,
            previousPath,
            selectedSlug,
        }),
        [
            docsDefinition,
            lightModeEnabled,
            docsInfo,
            setActiveVersion,
            activeTab,
            activeTabIndex,
            setActiveTabIndex,
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
        ]
    );

    return <DocsContext.Provider value={contextValue}>{children}</DocsContext.Provider>;
};
