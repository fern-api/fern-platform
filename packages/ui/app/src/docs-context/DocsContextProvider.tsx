import { FernRegistry } from "@fern-fern/registry-browser";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { assertNever } from "@fern-ui/core-utils";
import { useRouter } from "next/router";
import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react";
import { ResolvedUrlPath } from "../ResolvedUrlPath";
import { DocsContext, DocsContextValue, type DocsInfo } from "./DocsContext";
import { useSlugListeners } from "./useSlugListeners";

export declare namespace DocsContextProvider {
    export type Props = PropsWithChildren<{
        docsDefinition: FernRegistryDocsRead.DocsDefinition;
        docsInfo: DocsInfo;
        resolvedUrlPath: ResolvedUrlPath;
        nextPath: ResolvedUrlPath | undefined;
        previousPath: ResolvedUrlPath | undefined;
    }>;
}

export const DocsContextProvider: React.FC<DocsContextProvider.Props> = ({
    docsDefinition,
    docsInfo,
    resolvedUrlPath,
    nextPath,
    previousPath,
    children,
}) => {
    const router = useRouter();

    const [activeVersion, _setActiveVersion] = useState(inferredVersion);

    const rootSlug = activeVersion ?? "";

    const getFullSlug = useCallback((slug: string) => `${rootSlug ? `${rootSlug}/` : ""}${slug}`, [rootSlug]);

    const selectedSlugFromUrl = useMemo(() => {
        switch (resolvedUrlPath.type) {
            case "clientLibraries":
            case "endpoint":
            case "mdx-page":
            case "topLevelEndpoint":
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

    const docsInfo = useMemo<DocsInfo>(() => {
        if (inferredVersion != null && activeVersion != null) {
            assertIsVersionedNavigationConfig(docsDefinition.config.navigation);
            const configData = docsDefinition.config.navigation.versions.find(
                ({ version }) => activeVersion === version
            );
            if (configData == null) {
                throw new Error(
                    "Could not find the active navigation config. This is likely due to a bug in the application flow."
                );
            }
            return {
                type: "versioned",
                rootSlug,
                activeNavigationConfig: configData.config,
                activeVersion,
                versions: docsDefinition.config.navigation.versions.map(({ version }) => version),
            };
        } else {
            assertIsUnversionedNavigationConfig(docsDefinition.config.navigation);
            return {
                type: "unversioned",
                rootSlug,
                activeNavigationConfig: docsDefinition.config.navigation,
            };
        }
    }, [inferredVersion, activeVersion, docsDefinition.config.navigation, rootSlug]);

    const setActiveVersion = useCallback((version: string) => {
        _setActiveVersion(version);
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

    const navigateToPath = useCallback(
        (slugWithoutVersion: string, opts: NavigateToPathOpts = { omitVersionPrefix: false }) => {
            setJustNavigated(true);
            const slug = opts.omitVersionPrefix ? slugWithoutVersion : getFullSlug(slugWithoutVersion);
            setSelectedSlug(slug);
            navigateToPathListeners.invokeListeners(slug);

            const timeout = setTimeout(() => {
                setJustNavigated(false);
            }, 500);
            return () => {
                clearTimeout(timeout);
            };
        },
        [navigateToPathListeners, getFullSlug]
    );

    const scrollToPathListeners = useSlugListeners("scrollToPath", { selectedSlug });

    const onScrollToPath = useCallback(
        (slugWithoutVersion: string) => {
            const slug = getFullSlug(slugWithoutVersion);
            if (justNavigated || slug === selectedSlug) {
                return;
            }
            setSelectedSlug(slug);
            void router.push(`/${slug}`, undefined, { shallow: true });
            scrollToPathListeners.invokeListeners(slug);
        },
        [justNavigated, router, scrollToPathListeners, selectedSlug, getFullSlug]
    );

    const contextValue = useCallback(
        (): DocsContextValue => ({
            resolveApi,
            resolvePage,
            resolveFile,
            docsDefinition,
            docsInfo,
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
            docsInfo,
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
