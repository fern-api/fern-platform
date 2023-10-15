import { useDocsContext } from "../docs-context/useDocsContext";
import { BottomNavigationButton } from "./BottomNavigationButton";

export const BottomNavigationButtons: React.FC = () => {
    const { nextPath, previousPath } = useDocsContext();

    if (previousPath == null && nextPath == null) {
        return null;
    }

    return (
        <div className="flex flex-col">
            <div className="mb-6 mt-10 h-px bg-[#A7A7B0]/20"></div>
            <div className="flex justify-between">
                {previousPath ? <BottomNavigationButton path={previousPath} direction="previous" /> : <div />}
                {nextPath ? <BottomNavigationButton path={nextPath} direction="next" /> : <div />}
            </div>
        </div>
    );
};
