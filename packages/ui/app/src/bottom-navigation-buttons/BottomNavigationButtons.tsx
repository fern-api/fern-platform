import { FC } from "react";
import { useNavigationContext } from "../contexts/navigation-context";
import { BottomNavigationButton } from "./BottomNavigationButton";

export const BottomNavigationButtons: FC<{ showPrev?: boolean }> = ({ showPrev = false }) => {
    const { resolvedPath } = useNavigationContext();
    if (resolvedPath.type === "redirect") {
        return null;
    }
    const { prev: leftNeighbor, next: rightNeighbor } = resolvedPath.neighbors;

    if (leftNeighbor == null && rightNeighbor == null) {
        return null;
    }

    return (
        <div className="flex gap-6">
            {showPrev && leftNeighbor != null && <BottomNavigationButton neighbor={leftNeighbor} dir="prev" />}
            {rightNeighbor != null && <BottomNavigationButton neighbor={rightNeighbor} dir="next" />}
        </div>
    );
};
