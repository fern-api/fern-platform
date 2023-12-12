import { AbsolutelyPositionedAnchor } from "../../commons/AbsolutelyPositionedAnchor";
import { BlueprintIcon } from "../../commons/BlueprintIcon";
import { useNavigationContext } from "../../navigation-context";
import { getAnchorId } from "../../util/anchor";
import { Markdown } from "../markdown/Markdown";

export declare namespace EndpointSection {
    export type Props = React.PropsWithChildren<{
        title: string;
        description?: string;
        anchorIdParts: string[];
        route: string;
        expandAll: () => void;
        collapseAll: () => void;
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
    const { navigateToPath } = useNavigationContext();
    const anchorId = getAnchorId(anchorIdParts);
    const anchorRoute = `${route}#${anchorId}`;
    return (
        <div data-route={anchorRoute} className="flex scroll-mt-16 flex-col">
            <div className="group/anchor-container relative flex items-baseline gap-4 pb-3">
                <AbsolutelyPositionedAnchor href={anchorRoute} verticalPosition="center" />
                <div className="text-text-primary-light dark:text-text-primary-dark text-xl font-extrabold">
                    {title}
                </div>
                {showExpandCollapse && (
                    <div className="t-muted invisible flex gap-2 text-xs group-hover/anchor-container:visible">
                        <button
                            className="hover:underline"
                            onClick={() => {
                                navigateToPath(anchorRoute.substring(1));
                                handleExpandAll();
                            }}
                        >
                            <BlueprintIcon icon="plus" size={14} className="mr-0.5" />
                            Expand all
                        </button>
                        <button
                            className="hover:underline"
                            onClick={() => {
                                navigateToPath(anchorRoute.substring(1));
                                handleCollapseAll();
                            }}
                        >
                            <BlueprintIcon icon="minus" size={14} className="mr-0.5" />
                            Collapse all
                        </button>
                    </div>
                )}
            </div>
            {description != null && (
                <div className="mb-2">
                    <Markdown>{description}</Markdown>
                </div>
            )}
            <div className="flex flex-col">{children}</div>
        </div>
    );
};
