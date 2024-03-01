import { useNavigationContext } from "../navigation-context";
import { BottomNavigationButton } from "./BottomNavigationButton";

export const BottomNavigationButtons: React.FC = () => {
    const { resolvedPath } = useNavigationContext();
    if (resolvedPath.type === "redirect") {
        return null;
    }
    const { prev: leftNeighbor, next: rightNeighbor } = resolvedPath.neighbors;

    if (leftNeighbor == null && rightNeighbor == null) {
        return null;
    }

    return (
        <div>
            {/* <div className="flex justify-between py-10">
                {leftNeighbor != null ? (
                    <BottomNavigationButton docsNode={leftNeighbor} direction="previous" />
                ) : (
                    <div />
                )}
                {rightNeighbor != null ? <BottomNavigationButton docsNode={rightNeighbor} direction="next" /> : <div />}
            </div> */}
            {rightNeighbor != null && <BottomNavigationButton neighbor={rightNeighbor} />}
        </div>
    );
};
