import clsx from "clsx";
import { useAtomValue } from "jotai";
import { FC } from "react";
import { NEIGHBORS_ATOM } from "../atoms";
import { BottomNavigationButton } from "./BottomNavigationButton";

export const BottomNavigationButtons: FC<{ showPrev?: boolean }> = ({ showPrev = false }) => {
    const { prev: leftNeighbor, next: rightNeighbor } = useAtomValue(NEIGHBORS_ATOM);

    if (leftNeighbor == null && rightNeighbor == null) {
        return null;
    }

    if (showPrev) {
        return (
            <div className="not-prose grid gap-6 md:gap-8 lg:gap-12 grid-cols-2">
                {leftNeighbor != null ? <BottomNavigationButton neighbor={leftNeighbor} dir="prev" /> : <div />}
                {rightNeighbor != null ? <BottomNavigationButton neighbor={rightNeighbor} dir="next" /> : <div />}
            </div>
        );
    }

    if (rightNeighbor == null) {
        return null;
    }

    return (
        <div className={clsx("not-prose grid grid-cols-1")}>
            <BottomNavigationButton neighbor={rightNeighbor} dir="next" />
        </div>
    );
};
