import { APIV1Read, FernNavigation } from "@fern-api/fdr-sdk";
import { ReactElement } from "react";
import { HttpMethodTag } from "../../commons/HttpMethodTag";
import { useCollapseSidebar } from "../CollapseSidebarContext";
import { SidebarSlugLink } from "../SidebarLink";

interface SidebarApiLeafNodeProps {
    node: FernNavigation.NavigationNodeApiLeaf;
    depth: number;
}

export function SidebarApiLeafNode({ node, depth }: SidebarApiLeafNodeProps): React.ReactElement | null {
    const { registerScrolledToPathListener, selectedNodeId } = useCollapseSidebar();
    const selected = node.id === selectedNodeId;

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

            const httpMethodTags: Record<FernNavigation.HttpMethod, ReactElement> = {
                GET: <HttpMethodTag className="ml-2" method={APIV1Read.HttpMethod.Get} size="sm" active={selected} />,
                POST: <HttpMethodTag className="ml-2" method={APIV1Read.HttpMethod.Post} size="sm" active={selected} />,
                PUT: <HttpMethodTag className="ml-2" method={APIV1Read.HttpMethod.Put} size="sm" active={selected} />,
                PATCH: (
                    <HttpMethodTag className="ml-2" method={APIV1Read.HttpMethod.Patch} size="sm" active={selected} />
                ),
                DELETE: (
                    <HttpMethodTag className="ml-2" method={APIV1Read.HttpMethod.Delete} size="sm" active={selected} />
                ),
            };
            return httpMethodTags[node.method];
        }
    };

    return (
        <SidebarSlugLink
            slug={node.slug}
            title={node.title}
            depth={Math.max(0, depth - 1)}
            hidden={node.hidden}
            registerScrolledToPathListener={registerScrolledToPathListener}
            rightElement={renderRightElement()}
            selected={selected}
        />
    );
}
