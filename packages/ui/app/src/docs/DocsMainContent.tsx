import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useNavigationContext } from "../contexts/navigation-context.js";
import { useIsReady } from "../contexts/useIsReady.js";

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
    } else if (resolvedPath.type === "changelog-page") {
        return <ChangelogPage resolvedPath={resolvedPath} />;
    } else {
        return null;
    }
};
