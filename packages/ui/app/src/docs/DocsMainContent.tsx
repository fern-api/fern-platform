import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { FilterContextProvider } from "../contexts/filter-context/FilterContextProvider";
import { useNavigationContext } from "../contexts/navigation-context";
import { useIsReady } from "../contexts/useIsReady";
import { ChangelogEntryPage } from "./ChangelogEntryPage";

const CustomDocsPage = dynamic(
    () => import("../custom-docs-page/CustomDocsPage").then(({ CustomDocsPage }) => CustomDocsPage),
    {
        ssr: true,
    },
);

const ApiPage = dynamic(() => import("../api-page/ApiPage").then(({ ApiPage }) => ApiPage), {
    ssr: true,
});

const ChangelogPage = dynamic(() => import("./ChangelogPage").then(({ ChangelogPage }) => ChangelogPage), {
    ssr: true,
});

export interface DocsMainContentProps {}

export const DocsMainContent: React.FC<DocsMainContentProps> = () => {
    const { resolvedPath } = useNavigationContext();
    const hydrated = useIsReady();

    const router = useRouter();
    if (router.query.error === "true") {
        if (!hydrated) {
            return null;
        }
    }

    if (resolvedPath.type === "custom-markdown-page") {
        return <CustomDocsPage serializedMdxContent={resolvedPath.serializedMdxContent} resolvedPath={resolvedPath} />;
    } else if (resolvedPath.type === "api-page") {
        return <ApiPage initialApi={resolvedPath.apiDefinition} showErrors={resolvedPath.showErrors} />;
    } else if (resolvedPath.type === "changelog") {
        return (
            <FilterContextProvider>
                <ChangelogPage resolvedPath={resolvedPath} />
            </FilterContextProvider>
        );
    } else if (resolvedPath.type === "changelog-entry") {
        return <ChangelogEntryPage resolvedPath={resolvedPath} />;
    } else {
        return null;
    }
};
