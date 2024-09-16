import cn from "clsx";
import { FC, type PropsWithChildren } from "react";

export declare namespace CardGroup {
    export interface Props {
        cols?: number; // default 2, max 6
    }
}

export const CardGroup: FC<PropsWithChildren<CardGroup.Props>> = ({ children, cols = 2 }) => {
    return (
        <div
            className={cn("grid gap-4 sm:gap-6 my-6 first:mt-0", {
                "grid-cols-1": cols <= 1,
                "grid-cols-1 sm:grid-cols-2": cols === 2,
                "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3": cols === 3,
                "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4": cols === 4,
                "grid-cols-1 sm:grid-cols-2 xl:grid-cols-5": cols === 5,
                "grid-cols-1 sm:grid-cols-2 xl:grid-cols-6": cols >= 6,
            })}
        >
            {children}
        </div>
    );
};
