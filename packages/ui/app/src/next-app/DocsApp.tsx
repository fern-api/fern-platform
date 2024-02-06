import { FocusStyleManager } from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/datetime/lib/css/blueprint-datetime.css";
import "@blueprintjs/datetime2/lib/css/blueprint-datetime2.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/select/lib/css/blueprint-select.css";
import { APIV1Read, DocsV1Read, DocsV2Read, FdrAPI } from "@fern-api/fdr-sdk";
import type { ResolvedPath } from "@fern-ui/app-utils";
import { useDeepCompareMemoize } from "@fern-ui/react-commons";
import "@fontsource/ibm-plex-mono";
import "normalize.css";
import { useEffect } from "react";
import { initializePosthog } from "../analytics/posthog";
import { CONTEXTS } from "../contexts";
import { DocsContextProvider } from "../docs-context/DocsContextProvider";
import { Docs } from "../docs/Docs";
import { NavigationContextProvider } from "../navigation-context/NavigationContextProvider";
import "./globals.css";

FocusStyleManager.onlyShowFocusOnTabs();

export declare namespace App {
    export interface Props {
        baseUrl: DocsV2Read.BaseUrl;
        config: DocsV1Read.DocsConfig;
        search: DocsV1Read.SearchInfo;
        algoliaSearchIndex: DocsV1Read.AlgoliaSearchIndex | null;
        files: Record<DocsV1Read.FileId, DocsV1Read.Url>;
        apis: Record<FdrAPI.ApiId, APIV1Read.ApiDefinition>;
        resolvedPath: ResolvedPath;
    }
}

export const DocsApp: React.FC<App.Props> = ({
    baseUrl,
    config: unmemoizedConfig,
    search: unmemoizedSearch,
    algoliaSearchIndex,
    files,
    apis: unmemoizedApis,
    resolvedPath,
}) => {
    const search = useDeepCompareMemoize(unmemoizedSearch);
    const apis = useDeepCompareMemoize(unmemoizedApis);
    const config = useDeepCompareMemoize(unmemoizedConfig);

    useEffect(() => {
        initializePosthog();
    }, []);

    return (
        <div className="flex min-h-screen flex-1">
            <div className="w-full">
                {CONTEXTS.reduceRight(
                    (children, Context) => (
                        <Context>{children}</Context>
                    ),
                    <DocsContextProvider files={files} config={config} apis={apis} baseUrl={baseUrl}>
                        <NavigationContextProvider resolvedPath={resolvedPath} basePath={baseUrl.basePath}>
                            <Docs config={config} search={search} apis={apis} algoliaSearchIndex={algoliaSearchIndex} />
                        </NavigationContextProvider>
                    </DocsContextProvider>,
                )}
            </div>
        </div>
    );
};
