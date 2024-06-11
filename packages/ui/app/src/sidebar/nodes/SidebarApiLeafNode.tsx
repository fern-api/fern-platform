import { FernNavigation } from "@fern-api/fdr-sdk";
import { HttpMethodTag } from "../../commons/HttpMethodTag";
import { useNavigationContext } from "../../contexts/navigation-context";
import { useCollapseSidebar } from "../CollapseSidebarContext";
import { SidebarSlugLink } from "../SidebarLink";

interface SidebarApiLeafNodeProps {
    node: FernNavigation.NavigationNodeApiLeaf;
    depth: number;
}

export function SidebarApiLeafNode({ node, depth }: SidebarApiLeafNodeProps): React.ReactElement | null {
    const { registerScrolledToPathListener, selectedNodeId } = useCollapseSidebar();
    const { resolvedPath } = useNavigationContext();
    const selected = node.id === selectedNodeId;

    if (node.hidden && !selected) {
        return null;
    }

    const renderRightElement = () => {
        if (node.type === "webSocket") {
            return <HttpMethodTag method="WSS" size="sm" active={selected} rounded className="-mr-0.5" />;
        } else {
            if (node.type === "endpoint" && node.isResponseStream) {
                return <HttpMethodTag method="STREAM" size="sm" active={selected} rounded className="-mr-0.5" />;
            }

            return <HttpMethodTag method={node.method} size="sm" active={selected} rounded className="-mr-0.5" />;
        }
    };

    return (
        <SidebarSlugLink
            nodeId={node.id}
            slug={node.slug}
            title={node.title}
            depth={Math.max(0, depth - 1)}
            hidden={node.hidden}
            registerScrolledToPathListener={registerScrolledToPathListener}
            rightElement={renderRightElement()}
            selected={selected}
            shallow={resolvedPath.type === "api-page" && resolvedPath.api === node.apiDefinitionId}
        />
    );
}
