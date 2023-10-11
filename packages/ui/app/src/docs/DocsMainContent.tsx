import { ApiDefinitionContextProvider } from "../api-context/ApiDefinitionContextProvider";
import { ApiPage } from "../api-page/ApiPage";
import { CustomDocsPage } from "../custom-docs-page/CustomDocsPage";
import { useNavigationContext } from "../navigation-context";

export declare namespace DocsMainContent {
    export interface Props {}
}

export const DocsMainContent: React.FC<DocsMainContent.Props> = () => {
    const { activeNavigatable, serializedMdxContent } = useNavigationContext();

    // TODO: Implement
    switch (activeNavigatable.type) {
        case "page":
            return <CustomDocsPage serializedMdxContent={serializedMdxContent} navigatable={activeNavigatable} />;
        case "top-level-endpoint":
        case "top-level-webhook":
        case "endpoint":
        case "webhook":
            return (
                <ApiDefinitionContextProvider apiSection={activeNavigatable.section}>
                    <ApiPage />
                </ApiDefinitionContextProvider>
            );
        // case "api":
        //     return (
        //         <ApiDefinitionContextProvider
        //             apiSection={resolvedPathFromUrl.apiSection}
        //             apiSlug={resolvedPathFromUrl.slug}
        //         >
        //             <ApiPage />
        //         </ApiDefinitionContextProvider>
        //     );
        // case "clientLibraries":
        // case "apiSubpackage":
        // return (
        //     <ApiDefinitionContextProvider
        //         apiSection={resolvedPathFromUrl.apiSection}
        //         apiSlug={resolvedPathFromUrl.apiSlug}
        //     >
        //         <ApiPage />
        //     </ApiDefinitionContextProvider>
        // );
        // case "section":
        //     return (
        //         <RedirectToFirstNavigationItem
        //             items={resolvedPathFromUrl.section.items}
        //             slug={resolvedPathFromUrl.slug}
        //         />
        //     );
        // default:
        //     assertNever(resolvedPathFromUrl);
    }
    return null;
};
