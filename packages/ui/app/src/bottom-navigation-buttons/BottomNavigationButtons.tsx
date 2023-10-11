import { BottomNavigationButton } from "./BottomNavigationButton";
import { useNavigationContext } from "../navigation-context";

export const BottomNavigationButtons: React.FC = () => {
    const { activeNavigatableNeighbors } = useNavigationContext();
    const { previous: leftNeighbor, next: rightNeighbor } = activeNavigatableNeighbors;

    if (leftNeighbor == null && rightNeighbor == null) {
        return null;
    }

    return (
        <div className="flex flex-col">
            <div className="mb-6 mt-10 h-px bg-[#A7A7B0]/20"></div>
            <div className="flex justify-between">
                {leftNeighbor != null ? (
                    <BottomNavigationButton docsNode={leftNeighbor} direction="previous" />
                ) : (
                    <div />
                )}
                {rightNeighbor != null ? <BottomNavigationButton docsNode={rightNeighbor} direction="next" /> : <div />}
            </div>
        </div>
    );
};
