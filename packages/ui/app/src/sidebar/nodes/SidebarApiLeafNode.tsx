import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { useIsSelectedSidebarNode } from "../../atoms";
import { HttpMethodTag } from "../../components/HttpMethodTag";
import { SidebarSlugLink } from "../SidebarLink";

interface SidebarApiLeafNodeProps {
    node: FernNavigation.NavigationNodeApiLeaf;
    depth: number;
    shallow: boolean;
}

export function SidebarApiLeafNode({ node, depth, shallow }: SidebarApiLeafNodeProps): React.ReactElement | null {
    const selected = useIsSelectedSidebarNode(node.id);

    if (node.hidden && !selected) {
        return null;
    }

    const renderRightElement = () => {
        if (node.type === "webSocket") {
            return <HttpMethodTag method="WSS" size="sm" active={selected} />;
        } else {
            if (node.type === "endpoint" && node.isResponseStream) {
                return <HttpMethodTag method="STREAM" size="sm" active={selected} />;
            }

            return <HttpMethodTag method={node.method} size="sm" active={selected} />;
        }
    };

    return (
        <SidebarSlugLink
            nodeId={node.id}
            slug={node.slug}
            title={node.title}
            depth={Math.max(0, depth - 1)}
            hidden={node.hidden}
            authed={node.authed}
            icon={renderRightElement()}
            selected={selected}
            shallow={shallow}
        />
    );
}
