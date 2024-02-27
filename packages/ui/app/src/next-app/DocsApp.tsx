import { DocsV1Read, DocsV2Read } from "@fern-api/fdr-sdk";
import { useDeepCompareMemoize } from "@fern-ui/react-commons";
import "@fontsource/ibm-plex-mono";
import { useEffect, useState } from "react";
import { initializePosthog } from "../analytics/posthog";
import { CONTEXTS } from "../contexts";
import { DocsContextProvider } from "../docs-context/DocsContextProvider";
import { Docs } from "../docs/Docs";
import { NavigationContextProvider } from "../navigation-context/NavigationContextProvider";
import { SidebarNavigation } from "../sidebar/types";
import type { ResolvedPath } from "../util/ResolvedPath";
import { ResolvedNavigationItemApiSection } from "../util/resolver";

export declare namespace App {
    export interface Props {
        baseUrl: DocsV2Read.BaseUrl;
        navigation: SidebarNavigation;
        config: DocsV1Read.DocsConfig;
        search: DocsV1Read.SearchInfo;
        algoliaSearchIndex: DocsV1Read.AlgoliaSearchIndex | null;
        files: Record<DocsV1Read.FileId, DocsV1Read.File_>;
        resolvedPath: ResolvedPath;
    }
}

export const DocsApp: React.FC<App.Props> = ({
    baseUrl,
    navigation: unmemoizedNavigation,
    config: unmemoizedConfig,
    search: unmemoizedSearch,
    algoliaSearchIndex,
    files,
    resolvedPath: unmemoizedResolvedPath,
}) => {
    const search = useDeepCompareMemoize(unmemoizedSearch);
    const resolvedPath = useDeepCompareMemoize(unmemoizedResolvedPath);
    const config = useDeepCompareMemoize(unmemoizedConfig);
    const navigation = useDeepCompareMemoize(unmemoizedNavigation);

    useEffect(() => {
        initializePosthog();
    }, []);

    const [storedApis, setApis] = useState<ResolvedNavigationItemApiSection[]>(() =>
        resolvedPath.type === "api-page" ? [resolvedPath.apiSection] : [],
    );

    useEffect(() => {
        if (resolvedPath.type === "api-page") {
            setApis((prev) => {
                if (prev.find((item) => item.api === resolvedPath.apiSection.api)) {
                    return prev;
                }
                return prev.concat(resolvedPath.apiSection);
            });
        }
    }, [resolvedPath, resolvedPath.fullSlug, resolvedPath.type]);

    useEffect(() => {
        if (resolvedPath.type === "api-page") {
            void fetch(`/api/resolve-api?path=${resolvedPath.fullSlug}`).then(async (response) => {
                if (response.ok) {
                    const api = (await response.json()) as ResolvedNavigationItemApiSection;
                    setApis((prev) => prev.filter((item) => item.api !== api.api).concat(api));
                }
            });
        }
    }, [resolvedPath]);

    const apis = storedApis.length === 0 && resolvedPath.type === "api-page" ? [resolvedPath.apiSection] : storedApis;

    return (
        <div className="flex min-h-screen flex-1">
            <div className="w-full">
                {CONTEXTS.reduceRight(
                    (children, Context) => (
                        <Context>{children}</Context>
                    ),
                    <DocsContextProvider files={files} config={config} baseUrl={baseUrl}>
                        <NavigationContextProvider
                            resolvedPath={resolvedPath}
                            navigation={navigation}
                            basePath={baseUrl.basePath}
                        >
                            <Docs
                                config={config}
                                search={search}
                                apis={apis}
                                navigation={navigation}
                                algoliaSearchIndex={algoliaSearchIndex}
                            />
                        </NavigationContextProvider>
                    </DocsContextProvider>,
                )}
            </div>
        </div>
    );
};
