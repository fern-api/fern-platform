import { AbsolutelyPositionedAnchor } from "../../commons/AbsolutelyPositionedAnchor";
import { Markdown } from "../markdown/Markdown";

export declare namespace EndpointSection {
    export type Props = React.PropsWithChildren<{
        title: string;
        description?: string;
        anchor: string;
    }>;
}

export const EndpointSection: React.FC<EndpointSection.Props> = ({ title, description, anchor, children }) => {
    return (
        <div id={anchor} className="flex flex-col">
            <div className="group/anchor-container relative mb-3 flex items-center">
                <AbsolutelyPositionedAnchor anchor={anchor} verticalPosition="center" />
                <div className="text-lg font-medium">{title}</div>
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
