import { Icon } from "@blueprintjs/core";
import { AbsolutelyPositionedAnchor } from "../../commons/AbsolutelyPositionedAnchor";
import { useNavigationContext } from "../../navigation-context";
import { getAnchorId } from "../../util/anchor";
import { Markdown } from "../markdown/Markdown";

export declare namespace EndpointSection {
    export type Props = React.PropsWithChildren<{
        title: string;
        description?: string;
        anchorIdParts: string[];
        route: string;
        floatRightElement?: React.ReactNode;
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
    floatRightElement,
    showExpandCollapse,
    expandAll: handleExpandAll,
    collapseAll: handleCollapseAll,
}) => {
    const { navigateToPath } = useNavigationContext();
    const anchorId = getAnchorId(anchorIdParts);
    const anchorRoute = `${route}#${anchorId}`;
    return (
        <div data-route={anchorRoute} className="scroll-mt-20">
            {floatRightElement != null && (
                <div className="sticky top-20 z-10 float-right w-fit">{floatRightElement}</div>
            )}
            <div className="group/anchor-container relative mb-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 pb-3">
                <div className="flex items-baseline">
                    <AbsolutelyPositionedAnchor href={anchorRoute} verticalPosition="center" />
                    <div className="text-text-primary-light dark:text-text-primary-dark text-xl font-semibold">
                        {title}
                    </div>
                </div>
                {showExpandCollapse && (
                    <div className="t-muted invisible flex gap-2 text-xs group-hover/anchor-container:visible">
                        <button
                            className="whitespace-nowrap hover:underline"
                            onClick={() => {
                                navigateToPath(anchorRoute.substring(1));
                                handleExpandAll();
                            }}
                        >
                            <Icon icon="plus" size={14} className="mr-0.5" />
                            Expand all
                        </button>
                        <button
                            className="whitespace-nowrap hover:underline"
                            onClick={() => {
                                navigateToPath(anchorRoute.substring(1));
                                handleCollapseAll();
                            }}
                        >
                            <Icon icon="minus" size={14} className="mr-0.5" />
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
            <div>{children}</div>
        </div>
    );
};
