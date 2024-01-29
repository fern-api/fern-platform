import { APIV1Read, DocsV1Read, DocsV2Read, FdrAPI, PathResolver } from "@fern-api/fdr-sdk";
import { PropsWithChildren, useCallback, useMemo } from "react";
import { DocsContext } from "./DocsContext";

export declare namespace DocsContextProvider {
    export type Props = PropsWithChildren<{
        files: Record<DocsV1Read.FileId, DocsV1Read.Url>;
        apis: Record<FdrAPI.ApiId, APIV1Read.ApiDefinition>;
        config: DocsV1Read.DocsConfig;
        baseUrl: DocsV2Read.BaseUrl;
    }>;
}

export const DocsContextProvider: React.FC<DocsContextProvider.Props> = ({
    baseUrl,
    files,
    apis,
    config,
    children,
}) => {
    const resolveFile = useCallback(
        (fileId: DocsV1Read.FileId): DocsV1Read.Url | undefined => {
            const file = files[fileId];
            if (file == null) {
                // eslint-disable-next-line no-console
                console.error("File does not exist", fileId);
            }
            return file;
        },
        [files]
    );

    const pathResolver = useMemo(
        () =>
            new PathResolver({
                definition: {
                    apis,
                    docsConfig: config,
                    basePath: baseUrl.basePath,
                },
            }),
        [apis, baseUrl.basePath, config]
    );

    return (
        <DocsContext.Provider
            value={{
                domain: baseUrl.domain,
                basePath: baseUrl.basePath,
                pathResolver,
                resolveFile,
            }}
        >
            {children}
        </DocsContext.Provider>
    );
};
