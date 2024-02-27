import { DocsV1Read, DocsV2Read } from "@fern-api/fdr-sdk";
import { useDeepCompareMemoize } from "@fern-ui/react-commons";
import "@fontsource/ibm-plex-mono";
import { atom } from "jotai";
import { useEffect, useMemo, useRef } from "react";
import { initializePosthog } from "../analytics/posthog";
import { CONTEXTS } from "../contexts";
import { DocsContextProvider } from "../docs-context/DocsContextProvider";
import { Docs } from "../docs/Docs";
import { NavigationContextProvider } from "../navigation-context/NavigationContextProvider";
import { SidebarNavigation } from "../sidebar/types";
import type { ResolvedPath } from "../util/ResolvedPath";

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

    const apis = useMemo(() => {
        if (resolvedPath.type === "api-page") {
            return { [resolvedPath.api]: resolvedPath.apiDefinition };
        } else {
            return {};
        }
    }, [resolvedPath]);
    const apisAtom = useRef(atom(apis));

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
                                apisAtom={apisAtom.current}
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
