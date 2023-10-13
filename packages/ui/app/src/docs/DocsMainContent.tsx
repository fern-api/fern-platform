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
            if (activeNavigatable.type !== "page") {
                return null;
            }
            return (
                <CustomDocsPage
                    serializedMdxContent={resolvedPath.serializedMdxContent}
                    navigatable={activeNavigatable}
                />
            );
        case "api-page":
            return (
                <ApiDefinitionContextProvider apiSection={resolvedPath.apiSection}>
                    <ApiPage />
                </ApiDefinitionContextProvider>
            );
        default:
            return null;
    }
};
