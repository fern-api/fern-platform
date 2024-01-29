import { DocsV1Read, isApiNode } from "@fern-api/fdr-sdk";
import {
    crawlResolvedNavigationItemApiSections,
    ResolvedNavigationItem,
    ResolvedNavigationItemApiSection,
} from "@fern-ui/app-utils";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useMemo } from "react";
import { ApiPage } from "../api-page/ApiPage";
import { CustomDocsPage } from "../custom-docs-page/CustomDocsPage";
import { useNavigationContext } from "../navigation-context";

export interface DocsMainContentProps {
    navigationItems: ResolvedNavigationItem[];
    contentWidth: DocsV1Read.SizeConfig | undefined;
}

export const DocsMainContent: React.FC<DocsMainContentProps> = ({ navigationItems, contentWidth }) => {
    const { activeNavigatable, resolvedPath } = useNavigationContext();

    const apiSectionsById = useMemo(() => {
        const toRet = new Map<string, ResolvedNavigationItemApiSection>();
        crawlResolvedNavigationItemApiSections(navigationItems).forEach((item) => {
            toRet.set(item.api, item);
        });
        return toRet;
    }, [navigationItems]);

    const maxContentWidth =
        contentWidth == null
            ? "44rem"
            : visitDiscriminatedUnion(contentWidth, "type")._visit({
                  px: (px) => `${px.value}px`,
                  rem: (rem) => `${rem.value}rem`,
                  _other: () => "44rem",
              });

    if (activeNavigatable.type === "page" && resolvedPath.type === "custom-markdown-page") {
        return (
            <CustomDocsPage
                serializedMdxContent={resolvedPath.serializedMdxContent}
                navigatable={activeNavigatable}
                resolvedPath={resolvedPath}
                maxContentWidth={maxContentWidth}
            />
        );
    } else if (isApiNode(activeNavigatable)) {
        const apiSection = apiSectionsById.get(activeNavigatable.section.api);
        if (apiSection == null) {
            return null;
        }
        return <ApiPage apiSection={apiSection} maxContentWidth={maxContentWidth} />;
    } else {
        return null;
    }
};
