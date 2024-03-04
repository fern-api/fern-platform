import classNames from "classnames";
import { FC, type PropsWithChildren } from "react";

export declare namespace Cards {
    export interface Props {
        cols?: number; // default 2, max 6
    }
}

export const Cards: FC<PropsWithChildren<Cards.Props>> = ({ children, cols = 2 }) => {
    return (
        <div
            className={classNames("grid gap-4 sm:gap-6", {
                "grid-cols-1": cols <= 1,
                "grid-cols-1 sm:grid-cols-2": cols === 2,
                "grid-cols-1 sm:grid-cols-2 md:grid-cols-3": cols === 3,
                "grid-cols-1 sm:grid-cols-2 md:grid-cols-4": cols === 4,
                "grid-cols-1 sm:grid-cols-2 md:grid-cols-5": cols === 5,
                "grid-cols-1 sm:grid-cols-2 md:grid-cols-6": cols >= 6,
            })}
        >
            {children}
        </div>
    );
};
