import { isApiNode } from "@fern-api/fdr-sdk";
import {
    crawlResolvedNavigationItemApiSections,
    ResolvedNavigationItem,
    ResolvedNavigationItemApiSection,
} from "@fern-ui/app-utils";
import { useMemo } from "react";
import { ApiPage } from "../api-page/ApiPage";
import { CustomDocsPage } from "../custom-docs-page/CustomDocsPage";
import { useNavigationContext } from "../navigation-context";

export interface DocsMainContentProps {
    navigationItems: ResolvedNavigationItem[];
}

export const DocsMainContent: React.FC<DocsMainContentProps> = ({ navigationItems }) => {
    const { activeNavigatable, resolvedPath } = useNavigationContext();

    const apiSectionsById = useMemo(() => {
        const toRet = new Map<string, ResolvedNavigationItemApiSection>();
        crawlResolvedNavigationItemApiSections(navigationItems).forEach((item) => {
            toRet.set(item.api, item);
        });
        return toRet;
    }, [navigationItems]);

    if (activeNavigatable.type === "page" && resolvedPath.type === "custom-markdown-page") {
        return (
            <CustomDocsPage
                serializedMdxContent={resolvedPath.serializedMdxContent}
                navigatable={activeNavigatable}
                resolvedPath={resolvedPath}
            />
        );
    } else if (isApiNode(activeNavigatable)) {
        const apiSection = apiSectionsById.get(activeNavigatable.section.api);
        if (apiSection == null) {
            return null;
        }
        return <ApiPage apiSection={apiSection} />;
    } else {
        return null;
    }
};
