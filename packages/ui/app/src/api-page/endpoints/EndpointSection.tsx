import { Icon } from "@blueprintjs/core";
import { useRef } from "react";
import { AbsolutelyPositionedAnchor } from "../../commons/AbsolutelyPositionedAnchor";
import { getAnchorId } from "../../util/anchor";
import { Markdown } from "../markdown/Markdown";

export declare namespace EndpointSection {
    export type Props = React.PropsWithChildren<{
        title: string;
        description?: string;
        anchorIdParts: string[];
        route: string;
        expandAll?: () => void;
        collapseAll?: () => void;
        showExpandCollapse?: boolean;
    }>;
}

export const EndpointSection: React.FC<EndpointSection.Props> = ({
    title,
    description,
    anchorIdParts,
    route,
    children,
    showExpandCollapse,
    expandAll: handleExpandAll,
    collapseAll: handleCollapseAll,
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const anchorId = getAnchorId(anchorIdParts);
    const anchorRoute = `${route}#${anchorId}`;
    return (
        <div ref={ref} data-route={anchorRoute.toLowerCase()} className="flex scroll-mt-20 flex-col">
            <div className="group/anchor-container relative flex items-baseline gap-4 pb-3">
                <h3 className="relative mt-0 flex items-center">
                    <AbsolutelyPositionedAnchor href={anchorRoute} />
                    <span>{title}</span>
                </h3>
                {showExpandCollapse && (
                    <div className="t-muted invisible flex gap-2 text-xs group-hover/anchor-container:visible">
                        <button className="hover:underline" onClick={handleExpandAll}>
                            <Icon icon="plus" size={14} className="mr-0.5" />
                            Expand all
                        </button>
                        <button className="hover:underline" onClick={handleCollapseAll}>
                            <Icon icon="minus" size={14} className="mr-0.5" />
                            Collapse all
                        </button>
                    </div>
                )}
            </div>
            {description != null && (
                <div className="mb-2">
                    <Markdown className="text-base">{description}</Markdown>
                </div>
            )}
            <div className="flex flex-col">{children}</div>
        </div>
    );
};
