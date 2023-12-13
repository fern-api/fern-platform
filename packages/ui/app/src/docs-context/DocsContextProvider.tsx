import { APIV1Read, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { PropsWithChildren, useCallback } from "react";
import { DocsContext, DocsContextValue } from "./DocsContext";

export declare namespace DocsContextProvider {
    export type Props = PropsWithChildren<{
        docsDefinition: DocsV1Read.DocsDefinition;
    }>;
}

export const DocsContextProvider: React.FC<DocsContextProvider.Props> = ({ docsDefinition, children }) => {
    const resolveApi = useCallback(
        (apiId: FdrAPI.ApiDefinitionId): APIV1Read.ApiDefinition => {
            const api = docsDefinition.apis[apiId];
            if (api == null) {
                throw new Error("API does not exist: " + apiId);
            }
            return api;
        },
        [docsDefinition.apis]
    );

    const resolvePage = useCallback(
        (pageId: DocsV1Read.PageId): DocsV1Read.PageContent => {
            const page = docsDefinition.pages[pageId];
            if (page == null) {
                throw new Error("Page does not exist: " + pageId);
            }
            return page;
        },
        [docsDefinition.pages]
    );

    const resolveFile = useCallback(
        (fileId: DocsV1Read.FileId): DocsV1Read.Url => {
            const file = docsDefinition.files[fileId];
            if (file == null) {
                throw new Error("File does not exist: " + fileId);
            }
            return file;
        },
        [docsDefinition.files]
    );

    const contextValue = useCallback(
        (): DocsContextValue => ({
            docsDefinition,
            resolveApi,
            resolvePage,
            resolveFile,
        }),
        [docsDefinition, resolveApi, resolveFile, resolvePage]
    );

    return <DocsContext.Provider value={contextValue}>{children}</DocsContext.Provider>;
};
