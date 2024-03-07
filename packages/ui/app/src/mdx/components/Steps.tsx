import classNames from "classnames";
import { ComponentProps, ReactElement } from "react";
import "./Steps.scss";

export function Steps({ children, className, ...props }: ComponentProps<"div">): ReactElement {
    return (
        <div className={classNames("fern-steps", className)} {...props}>
            {children}
        </div>
    );
}
