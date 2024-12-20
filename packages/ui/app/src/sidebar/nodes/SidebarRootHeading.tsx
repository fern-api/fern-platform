import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { RemoteFontAwesomeIcon } from "@fern-ui/components";
import clsx from "clsx";
import { ReactElement } from "react";
import { SidebarPageNode } from "./SidebarPageNode";

interface SidebarRootHeadingProps {
    node: FernNavigation.NavigationNodeSection;
    className: string | undefined;
    shallow?: boolean;
}

export function SidebarRootHeading({ node, className, shallow }: SidebarRootHeadingProps): ReactElement {
    if (FernNavigation.hasMarkdown(node)) {
        return (
            <SidebarPageNode
                node={node}
                depth={0}
                className={className}
                linkClassName="font-semibold !text-text-default"
                shallow={shallow}
            />
        );
    }

    return (
        <div className={clsx("fern-sidebar-heading", className)}>
            {node.icon != null && <RemoteFontAwesomeIcon icon={node.icon} />}
            <span className="fern-sidebar-heading-content">{node.title}</span>
        </div>
    );
}
