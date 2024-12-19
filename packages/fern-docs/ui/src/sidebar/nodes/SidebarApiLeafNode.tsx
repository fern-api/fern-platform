import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { HttpMethodBadge } from "@fern-docs/components/badges";
import clsx from "clsx";
import { useIsSelectedSidebarNode } from "../../atoms";
import { SidebarSlugLink } from "../SidebarLink";

interface SidebarApiLeafNodeProps {
    node: FernNavigation.NavigationNodeApiLeaf;
    depth: number;
    shallow: boolean;
}

export function SidebarApiLeafNode({
    node,
    depth,
    shallow,
}: SidebarApiLeafNodeProps): React.ReactElement | null {
    const selected = useIsSelectedSidebarNode(node.id);

    if (node.hidden && !selected) {
        return null;
    }

    const renderLeftElement = () => {
        if (node.type === "webSocket") {
            return (
                <HttpMethodBadge
                    method="GET"
                    size="sm"
                    variant={selected ? "solid" : "subtle"}
                >
                    WSS
                </HttpMethodBadge>
            );
        } else {
            if (node.type === "endpoint" && node.isResponseStream) {
                return (
                    <HttpMethodBadge
                        method={node.method}
                        size="sm"
                        variant={selected ? "solid" : "subtle"}
                        className={clsx({
                            "tracking-tighter": node.isResponseStream,
                        })}
                    >
                        STREAM
                    </HttpMethodBadge>
                );
            }

            return (
                <HttpMethodBadge
                    method={node.method}
                    size="sm"
                    variant={selected ? "solid" : "subtle"}
                />
            );
        }
    };

    // const renderRightElement = () => {
    //     if (node.availability == null) {
    //         return undefined;
    //     }
    //     return <AvailabilityBadge availability={node.availability} size="sm" rounded className="ms-1" />;
    // };

    return (
        <SidebarSlugLink
            nodeId={node.id}
            slug={node.slug}
            title={
                <span
                    className={clsx({
                        "opacity-70 line-through":
                            node.availability === "Deprecated",
                    })}
                >
                    {node.title}
                </span>
            }
            depth={Math.max(0, depth - 1)}
            hidden={node.hidden}
            authed={node.authed}
            icon={renderLeftElement()}
            selected={selected}
            shallow={shallow}
        />
    );
}
