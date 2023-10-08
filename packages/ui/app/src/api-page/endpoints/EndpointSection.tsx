import { AbsolutelyPositionedAnchor } from "../../commons/AbsolutelyPositionedAnchor";
import { HEADER_HEIGHT } from "../../constants";
import { getAnchorId } from "../../util/anchor";
import { Markdown } from "../markdown/Markdown";

export declare namespace EndpointSection {
    export type Props = React.PropsWithChildren<{
        title: string;
        description?: string;
        anchorIdParts: string[];
    }>;
}

export const EndpointSection: React.FC<EndpointSection.Props> = ({ title, description, anchorIdParts, children }) => {
    const anchor = getAnchorId(anchorIdParts);
    return (
        <div data-anchor={anchor} className="flex flex-col" style={{ scrollMarginTop: HEADER_HEIGHT }}>
            <div className="group/anchor-container relative mb-3 flex items-center">
                <AbsolutelyPositionedAnchor anchor={anchor} verticalPosition="center" />
                <div className="text-text-primary-light dark:text-text-primary-dark text-xl font-extrabold">
                    {title}
                </div>
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
