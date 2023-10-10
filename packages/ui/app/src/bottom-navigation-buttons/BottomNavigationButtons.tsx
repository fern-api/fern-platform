// import { BottomNavigationButton } from "./BottomNavigationButton";

export const BottomNavigationButtons: React.FC = () => {
    // TODO: Implement
    const nextNavigatable = null;
    const previousNavigatable = null;

    if (previousNavigatable == null && nextNavigatable == null) {
        return null;
    }

    return (
        <div className="flex flex-col">
            <div className="mb-6 mt-10 h-px bg-[#A7A7B0]/20"></div>
            <div className="flex justify-between">
                {/* TODO: Add */}
                {/* {previousNavigatable != null ? <BottomNavigationButton path={null} direction="previous" /> : <div />}
                {nextNavigatable != null ? <BottomNavigationButton path={null} direction="next" /> : <div />} */}
            </div>
        </div>
    );
};
