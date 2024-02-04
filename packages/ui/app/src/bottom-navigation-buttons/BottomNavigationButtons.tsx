import { useNavigationContext } from "../navigation-context";
import { BottomNavigationButton } from "./BottomNavigationButton";

export const BottomNavigationButtons: React.FC = () => {
    const { activeNavigatableNeighbors } = useNavigationContext();
    const { previous: leftNeighbor, next: rightNeighbor } = activeNavigatableNeighbors;

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
            {rightNeighbor != null && <BottomNavigationButton docsNode={rightNeighbor} />}
        </div>
    );
};
