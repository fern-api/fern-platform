import clsx from "clsx";
import { type MouseEventHandler, type PropsWithChildren } from "react";

export declare namespace ApiPageMargins {
    export interface Props {
        onClick?: MouseEventHandler<HTMLDivElement>;
        className?: string;
    }
}

export const ApiPageMargins: React.FC<PropsWithChildren<ApiPageMargins.Props>> = ({ children, className, onClick }) => {
    return (
        <div className={clsx("px-[5vw]", className)} onClick={onClick}>
            {children}
        </div>
    );
};
