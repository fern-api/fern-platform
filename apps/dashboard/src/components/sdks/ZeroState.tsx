import { RemoteFontAwesomeIcon } from "@fern-ui/components";
import { ReactNode } from "react";

export interface ZeroStateProps {
    icon?: string | ReactNode;
    title: string;
    description: string;
}

export const ZeroState: React.FC<ZeroStateProps> = (props) => {
    return (
        <div className="flex flex-col items-center gap-y-4 p-20 text-center">
            {typeof props.icon === "string" ? <RemoteFontAwesomeIcon icon={props.icon} size={15} /> : props.icon}
            <div className="text-2xl font-bold">{props.title}</div>
            <div className="text-lg text-gray-500">{props.description}</div>
        </div>
    );
};
