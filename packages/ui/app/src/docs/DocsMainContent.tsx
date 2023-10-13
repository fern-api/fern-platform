import { isApiNode } from "@fern-ui/app-utils";
import { ApiDefinitionContextProvider } from "../api-context/ApiDefinitionContextProvider";
import { ApiPage } from "../api-page/ApiPage";
import { CustomDocsPage } from "../custom-docs-page/CustomDocsPage";
import { useNavigationContext } from "../navigation-context";

export declare namespace DocsMainContent {
    export interface Props {}
}

export const DocsMainContent: React.FC<DocsMainContent.Props> = () => {
    const { activeNavigatable, resolvedPath } = useNavigationContext();

    if (activeNavigatable.type === "page" && resolvedPath.type === "custom-markdown-page") {
        return (
            <CustomDocsPage
                serializedMdxContent={resolvedPath.serializedMdxContent}
                navigatable={activeNavigatable}
                resolvedPath={resolvedPath}
            />
        );
    } else if (isApiNode(activeNavigatable)) {
        return (
            <ApiDefinitionContextProvider apiSection={activeNavigatable.section}>
                <ApiPage />
            </ApiDefinitionContextProvider>
        );
    } else {
        return null;
    }
};
