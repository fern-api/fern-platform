import { APIV1Read, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { useDeepCompareMemoize } from "@fern-ui/react-commons";
import { PropsWithChildren, useCallback } from "react";
import { DocsContext } from "./DocsContext";

export declare namespace DocsContextProvider {
    export type Props = PropsWithChildren<{
        docsDefinition: DocsV1Read.DocsDefinition;
        domain: string;
    }>;
}

export const DocsContextProvider: React.FC<DocsContextProvider.Props> = ({
    domain,
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

    return (
        <DocsContext.Provider
            value={{
                domain,
                docsDefinition,
                resolveApi,
                resolvePage,
                resolveFile,
            }}
        >
            {children}
        </DocsContext.Provider>
    );
};
