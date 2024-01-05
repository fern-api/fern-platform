import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { ReactElement } from "react";

type EmptyProps = {
    name: string;
    description: string;
};

export const Empty = ({ name, description }: EmptyProps): ReactElement => {
    return (
        <div className="flex flex-col items-center ">
            <Icon icon={IconNames.INBOX} size={20} className="t-primary mb-1" />
            <div className="t-primary"> {name} </div>
            <div className="t-muted"> {description} </div>
        </div>
    );
};
