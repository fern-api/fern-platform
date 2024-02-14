import { isApiNode } from "@fern-api/fdr-sdk";
import {
    crawlResolvedNavigationItemApiSections,
    ResolvedNavigationItem,
    ResolvedNavigationItemApiSection,
} from "@fern-ui/app-utils";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { WEBSOCKET_MOCK } from "../api-page/web-socket/GenericMockWebSocket";
import { SPECIFIC_WEBSOCKET_MOCK } from "../api-page/web-socket/SpecificMockWebSocket";
import { WebSocket } from "../api-page/web-socket/WebSocket";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useNavigationContext } from "../navigation-context";

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
    navigationItems: ResolvedNavigationItem[];
}

export const DocsMainContent: React.FC<DocsMainContentProps> = ({ navigationItems }) => {
    const { activeNavigatable, resolvedPath } = useNavigationContext();
    const { domain } = useDocsContext();

    const apiSectionsById = useMemo(() => {
        const toRet = new Map<string, ResolvedNavigationItemApiSection>();
        crawlResolvedNavigationItemApiSections(navigationItems).forEach((item) => {
            toRet.set(item.api, item);
        });
        return toRet;
    }, [navigationItems]);

    if (activeNavigatable?.type === "page" && resolvedPath.type === "custom-markdown-page") {
        return (
            <CustomDocsPage
                serializedMdxContent={resolvedPath.serializedMdxContent}
                navigatable={activeNavigatable}
                resolvedPath={resolvedPath}
            />
        );
    } else if (activeNavigatable != null && isApiNode(activeNavigatable)) {
        const apiSection = apiSectionsById.get(activeNavigatable.section.api);
        if (apiSection == null) {
            return null;
        }
        return <ApiPage apiSection={apiSection} />;
    } else if (resolvedPath.type === "api-page" && resolvedPath.fullSlug === "fern-websocket-example") {
        // backdoor for websocket example
        return (
            <div className="min-h-0 pb-36">
                <WebSocket websocket={WEBSOCKET_MOCK} />
            </div>
        );
    } else if (resolvedPath.type === "api-page" && resolvedPath.fullSlug === "wss-chat") {
        // backdoor for websocket example for demo
        return (
            <div className="min-h-0 pb-36">
                <WebSocket websocket={SPECIFIC_WEBSOCKET_MOCK} />
            </div>
        );
    } else {
        return null;
    }
};
