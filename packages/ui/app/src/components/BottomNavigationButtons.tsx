import { FC } from "react";
import { useResolvedPath } from "../atoms/navigation";
import { BottomNavigationButton } from "./BottomNavigationButton";

export const BottomNavigationButtons: FC<{ showPrev?: boolean }> = ({ showPrev = false }) => {
    const resolvedPath = useResolvedPath();
    if (resolvedPath.type === "changelog") {
        return null;
    }

    const { prev: leftNeighbor, next: rightNeighbor } = resolvedPath.neighbors;

    if (leftNeighbor == null && rightNeighbor == null) {
        return null;
    }

    return (
        <div className="not-prose flex gap-6">
            {showPrev && leftNeighbor != null && <BottomNavigationButton neighbor={leftNeighbor} dir="prev" />}
            {rightNeighbor != null && <BottomNavigationButton neighbor={rightNeighbor} dir="next" />}
        </div>
    );
};
