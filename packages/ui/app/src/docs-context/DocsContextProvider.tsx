import { APIV1Read, DocsV1Read, DocsV2Read, FdrAPI, PathResolver } from "@fern-api/fdr-sdk";
import { useDeepCompareMemoize } from "@fern-ui/react-commons";
import { PropsWithChildren, useCallback, useMemo } from "react";
import { DocsContext } from "./DocsContext";

export declare namespace DocsContextProvider {
    export type Props = PropsWithChildren<{
        docsDefinition: DocsV1Read.DocsDefinition;
        baseUrl: DocsV2Read.BaseUrl;
    }>;
}

export const DocsContextProvider: React.FC<DocsContextProvider.Props> = ({
    baseUrl,
    docsDefinition: unmemoizedDocsDefinition,
    children,
}) => {
    const docsDefinition = useDeepCompareMemoize(unmemoizedDocsDefinition);

    const resolveApi = useCallback(
        (apiId: FdrAPI.ApiDefinitionId): APIV1Read.ApiDefinition | undefined => {
            const api = docsDefinition.apis[apiId];
            if (api == null) {
                // eslint-disable-next-line no-console
                console.error("API does not exist", apiId);
            }
            return api;
        },
        [docsDefinition.apis]
    );

    const resolvePage = useCallback(
        (pageId: DocsV1Read.PageId): DocsV1Read.PageContent | undefined => {
            const page = docsDefinition.pages[pageId];
            if (page == null) {
                // eslint-disable-next-line no-console
                console.error("Page does not exist", pageId);
            }
            return page;
        },
        [docsDefinition.pages]
    );

    const resolveFile = useCallback(
        (fileId: DocsV1Read.FileId): DocsV1Read.Url | undefined => {
            const file = docsDefinition.files[fileId];
            if (file == null) {
                // eslint-disable-next-line no-console
                console.error("File does not exist", fileId);
            }
            return file;
        },
        [docsDefinition.files]
    );

    const pathResolver = useMemo(
        () =>
            new PathResolver({
                definition: {
                    apis: docsDefinition.apis,
                    docsConfig: docsDefinition.config,
                    basePath: baseUrl.basePath,
                },
            }),
        [baseUrl.basePath, docsDefinition.apis, docsDefinition.config]
    );

    return (
        <DocsContext.Provider
            value={{
                domain: baseUrl.domain,
                basePath: baseUrl.basePath,
                docsDefinition,
                pathResolver,
                resolveApi,
                resolvePage,
                resolveFile,
            }}
        >
            {children}
        </DocsContext.Provider>
    );
};
