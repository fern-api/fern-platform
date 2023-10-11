import { BottomNavigationButton } from "./BottomNavigationButton";
import { useNavigationContext } from "../navigation-context";

export const BottomNavigationButtons: React.FC = () => {
    const { navigatableNeighbors } = useNavigationContext();
    const { previousNavigatable, nextNavigatable } = navigatableNeighbors;

    if (previousNavigatable == null && nextNavigatable == null) {
        return null;
    }

    return (
        <div className="flex flex-col">
            <div className="mb-6 mt-10 h-px bg-[#A7A7B0]/20"></div>
            <div className="flex justify-between">
                {previousNavigatable != null ? (
                    <BottomNavigationButton navigatable={previousNavigatable} direction="previous" />
                ) : (
                    <div />
                )}
                {nextNavigatable != null ? (
                    <BottomNavigationButton navigatable={nextNavigatable} direction="next" />
                ) : (
                    <div />
                )}
            </div>
        </div>
    );
};
