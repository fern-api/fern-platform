import { AbsolutelyPositionedAnchor } from "../../commons/AbsolutelyPositionedAnchor";
import { getAnchorId } from "../../util/anchor";
import { Markdown } from "../markdown/Markdown";

export declare namespace EndpointSection {
    export type Props = React.PropsWithChildren<{
        title: string;
        description?: string;
        anchorIdParts: string[];
        route: string;
    }>;
}

export const EndpointSection: React.FC<EndpointSection.Props> = ({
    title,
    description,
    anchorIdParts,
    route,
    children,
}) => {
    const anchorId = getAnchorId(anchorIdParts);
    const anchorRoute = `${route}#${anchorId}`;
    return (
        <div data-route={anchorRoute} className="flex scroll-mt-16 flex-col">
            <div className="group/anchor-container relative mb-3 flex items-center">
                <AbsolutelyPositionedAnchor href={anchorRoute} verticalPosition="center" />
                <div className="text-text-primary-light dark:text-text-primary-dark text-xl font-semibold">{title}</div>
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
