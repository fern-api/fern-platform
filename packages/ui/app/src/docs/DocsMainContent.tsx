import dynamic from "next/dynamic";
import { useNavigationContext } from "../navigation-context";
import { ResolvedRootPackage } from "../util/resolver";

const CustomDocsPage = dynamic(
    () => import("../custom-docs-page/CustomDocsPage").then(({ CustomDocsPage }) => CustomDocsPage),
    {
        ssr: true,
    },
);

const ApiPage = dynamic(() => import("../api-page/ApiPage").then(({ ApiPage }) => ApiPage), {
    ssr: true,
});

export interface DocsMainContentProps {
    apis: Record<string, ResolvedRootPackage>;
}

export const DocsMainContent: React.FC<DocsMainContentProps> = ({ apis }) => {
    const { resolvedPath } = useNavigationContext();

    if (resolvedPath.type === "custom-markdown-page") {
        return <CustomDocsPage serializedMdxContent={resolvedPath.serializedMdxContent} resolvedPath={resolvedPath} />;
    } else if (resolvedPath.type === "api-page") {
        const apiDefinition = apis[resolvedPath.api];
        if (apiDefinition == null) {
            return null;
        }
        return (
            <ApiPage
                apiDefinition={apiDefinition}
                artifacts={resolvedPath.artifacts}
                showErrors={resolvedPath.showErrors}
                fullSlug={resolvedPath.fullSlug}
                sectionUrlSlug={resolvedPath.sectionUrlSlug}
                skipUrlSlug={resolvedPath.skipUrlSlug}
            />
        );
    } else {
        return null;
    }
};
