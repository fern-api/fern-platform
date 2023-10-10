// import { assertNever } from "@fern-ui/core-utils";
// import { ApiDefinitionContextProvider } from "../api-context/ApiDefinitionContextProvider";
// import { ApiPage } from "../api-page/ApiPage";
// import { CustomDocsPage } from "../custom-docs-page/CustomDocsPage";
// import { useDocsContext } from "../docs-context/useDocsContext";
// import { RedirectToFirstNavigationItem } from "./RedirectToFirstNavigationItem";

export declare namespace DocsMainContent {
    export interface Props {}
}

export const DocsMainContent: React.FC<DocsMainContent.Props> = () => {
    // TODO: Implement

    // const { resolvedPathFromUrl } = useDocsContext();

    // switch (resolvedPathFromUrl.type) {
    //     case "mdx-page":
    //         return <CustomDocsPage path={resolvedPathFromUrl} />;
    //     case "api":
    //         return (
    //             <ApiDefinitionContextProvider
    //                 apiSection={resolvedPathFromUrl.apiSection}
    //                 apiSlug={resolvedPathFromUrl.slug}
    //             >
    //                 <ApiPage />
    //             </ApiDefinitionContextProvider>
    //         );
    //     case "clientLibraries":
    //     case "apiSubpackage":
    //     case "endpoint":
    //     case "webhook":
    //     case "topLevelEndpoint":
    //     case "topLevelWebhook":
    //         return (
    //             <ApiDefinitionContextProvider
    //                 apiSection={resolvedPathFromUrl.apiSection}
    //                 apiSlug={resolvedPathFromUrl.apiSlug}
    //             >
    //                 <ApiPage />
    //             </ApiDefinitionContextProvider>
    //         );
    //     case "section":
    //         return (
    //             <RedirectToFirstNavigationItem
    //                 items={resolvedPathFromUrl.section.items}
    //                 slug={resolvedPathFromUrl.slug}
    //             />
    //         );
    //     default:
    //         assertNever(resolvedPathFromUrl);

    return null;
};
