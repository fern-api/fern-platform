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
            <div className={clsx("fern-sidebar-heading px-4 lg:px-3 inline-flex items-center", className)}>
                {node.icon != null && <RemoteFontAwesomeIcon icon={node.icon} className="mr-3 text-faded shrink-0" />}
                <span className="m-0 text-base leading-6 lg:text-sm lg:leading-5 font-semibold">{node.title}</span>
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
