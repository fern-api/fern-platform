import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { RemoteFontAwesomeIcon } from "@fern-ui/components";
import clsx from "clsx";
import { ReactElement } from "react";
import { useIsSelectedSidebarNode } from "../../atoms";
import { SidebarSlugLink } from "../SidebarLink";

interface SidebarRootHeadingProps {
    node: FernNavigation.NavigationNodeSection;
    className: string | undefined;
    shallow?: boolean;
}

export function SidebarRootHeading({ node, className, shallow }: SidebarRootHeadingProps): ReactElement {
    const selected = useIsSelectedSidebarNode(node.id);

    if (node.overviewPageId == null) {
        return (
            <div className={clsx("fern-sidebar-heading", className)}>
                {node.icon != null && <RemoteFontAwesomeIcon icon={node.icon} />}
                <span className="fern-sidebar-heading-content">{node.title}</span>
            </div>
        );
    }

    return (
        <SidebarSlugLink
            nodeId={node.id}
            linkClassName="font-semibold !text-text-default"
            icon={node.icon}
            className={className}
            title={node.title}
            hidden={node.hidden}
            authed={node.authed}
            slug={node.slug}
            selected={selected}
            shallow={shallow}
        />
    );
}
