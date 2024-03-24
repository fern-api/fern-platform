import { DocsV1Read, DocsV2Read } from "@fern-api/fdr-sdk";
import { ColorsConfig } from "@fern-ui/fdr-utils";
import { PropsWithChildren, useCallback } from "react";
import { DocsContext } from "./DocsContext";

export declare namespace DocsContextProvider {
    export type Props = PropsWithChildren<{
        files: Record<DocsV1Read.FileId, DocsV1Read.File_>;
        layout: DocsV1Read.DocsLayoutConfig | undefined;
        typography: DocsV1Read.DocsTypographyConfigV2 | undefined;
        css: DocsV1Read.CssConfig | undefined;
        colors: ColorsConfig;
        baseUrl: DocsV2Read.BaseUrl;
    }>;
}

export const DocsContextProvider: React.FC<DocsContextProvider.Props> = ({
    baseUrl,
    files,
    layout,
    typography,
    css,
    colors,
    children,
}) => {
    const resolveFile = useCallback(
        (fileId: DocsV1Read.FileId): DocsV1Read.File_ | undefined => {
            const file = files[fileId];
            if (file == null) {
                // eslint-disable-next-line no-console
                console.error("File does not exist", fileId);
            }
            return file;
        },
        [files],
    );
    return (
        <DocsContext.Provider
            value={{
                domain: baseUrl.domain,
                basePath: baseUrl.basePath,
                layout,
                colors,
                typography,
                css,
                files,
                resolveFile,
            }}
        >
            {children}
        </DocsContext.Provider>
    );
};
