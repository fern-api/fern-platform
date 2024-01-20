import classNames from "classnames";
import React, { PropsWithChildren } from "react";

export declare namespace MonospaceText {
    export type Props = PropsWithChildren<{
        className?: string;
    }>;
}

export const MonospaceText: React.FC<MonospaceText.Props> = ({ className, children }) => {
    return <div className={classNames(className, "font-mono")}>{children}</div>;
};
