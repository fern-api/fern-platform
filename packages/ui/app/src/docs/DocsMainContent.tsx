import { isApiNode } from "@fern-api/fdr-sdk";
import { ApiDefinitionContextProvider } from "../api-context/ApiDefinitionContextProvider";
import { ApiPage } from "../api-page/ApiPage";
import { CustomDocsPage } from "../custom-docs-page/CustomDocsPage";
import { useNavigationContext } from "../navigation-context";

export declare namespace DocsMainContent {
    export interface Props {}
}

export const DocsMainContent: React.FC<DocsMainContent.Props> = () => {
    const { activeNavigatable, resolvedPath } = useNavigationContext();

    switch (resolvedPath.type) {
        case "custom-markdown-page":
            return <CustomDocsPage resolvedPath={resolvedPath} />;
        case "api-page": {
            const apiSection = isApiNode(activeNavigatable) ? activeNavigatable.section : resolvedPath.apiSection;
            return (
                <ApiDefinitionContextProvider apiSection={apiSection}>
                    <ApiPage />
                </ApiDefinitionContextProvider>
            );
        }
    }
};
