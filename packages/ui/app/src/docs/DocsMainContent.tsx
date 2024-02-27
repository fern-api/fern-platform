import { PrimitiveAtom, useAtom } from "jotai";
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
    apisAtom: PrimitiveAtom<Record<string, ResolvedRootPackage>>;
}

export const DocsMainContent: React.FC<DocsMainContentProps> = ({ apisAtom }) => {
    const { resolvedPath } = useNavigationContext();
    const [apis] = useAtom(apisAtom);

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
                atomApi={apisAtom}
            />
        );
    } else {
        return null;
    }
};
