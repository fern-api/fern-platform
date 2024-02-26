import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useNavigationContext } from "../navigation-context";
import { isApiPage } from "../sidebar/types";
import { ResolvedNavigationItemApiSection } from "../util/resolver";

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
    apis: ResolvedNavigationItemApiSection[];
}

export const DocsMainContent: React.FC<DocsMainContentProps> = ({ apis }) => {
    const { activeNavigatable, resolvedPath } = useNavigationContext();

    const apiSectionsById = useMemo(() => {
        const toRet = new Map<string, ResolvedNavigationItemApiSection>();
        apis.forEach((item) => {
            toRet.set(item.api, item);
        });
        return toRet;
    }, [apis]);

    if (activeNavigatable?.type === "page" && resolvedPath.type === "custom-markdown-page") {
        return (
            <CustomDocsPage
                serializedMdxContent={resolvedPath.serializedMdxContent}
                navigatable={activeNavigatable}
                resolvedPath={resolvedPath}
            />
        );
    } else if (activeNavigatable != null && isApiPage(activeNavigatable)) {
        const apiSection = apiSectionsById.get(activeNavigatable.api);
        if (apiSection == null) {
            return null;
        }
        return <ApiPage apiSection={apiSection} />;
    } else {
        return null;
    }
};
