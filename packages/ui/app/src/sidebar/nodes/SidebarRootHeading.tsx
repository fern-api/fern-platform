import { FernNavigation } from "@fern-api/fdr-sdk";
import { RemoteFontAwesomeIcon } from "@fern-ui/components";
import clsx from "clsx";
import { ReactElement } from "react";
import { useCurrentNodeId } from "../../atoms";
import { useCollapseSidebar } from "../CollapseSidebarContext";
import { SidebarSlugLink } from "../SidebarLink";

interface SidebarRootHeadingProps {
    node: FernNavigation.NavigationNodeSection;
    className: string | undefined;
}

export function SidebarRootHeading({ node, className }: SidebarRootHeadingProps): ReactElement {
    const { registerScrolledToPathListener } = useCollapseSidebar();
    const selectedNodeId = useCurrentNodeId();

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
            registerScrolledToPathListener={registerScrolledToPathListener}
            title={node.title}
            hidden={node.hidden}
            slug={node.slug}
            selected={node.id === selectedNodeId}
        />
    );
}
