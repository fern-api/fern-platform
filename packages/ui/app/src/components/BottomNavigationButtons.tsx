import { FC } from "react";
import { BottomNavigationButton } from "./BottomNavigationButton";

interface BottomNavigationButtonsProps {
    next?: Omit<BottomNavigationButton.Props, "dir">;
    prev?: Omit<BottomNavigationButton.Props, "dir">;
    alwaysShowGrid?: boolean;
}

export const BottomNavigationButtons: FC<BottomNavigationButtonsProps> = ({ prev, next, alwaysShowGrid }) => {
    if (prev == null && next == null) {
        return null;
    }

    return (
        <div
            className={
                (prev != null && next != null) || alwaysShowGrid
                    ? "not-prose grid gap-6 md:gap-8 lg:gap-12 grid-cols-2"
                    : "not-prose grid grid-cols-1"
            }
        >
            {prev != null && <BottomNavigationButton {...prev} dir="prev" />}
            {next != null && <BottomNavigationButton {...next} dir="next" className="col-start-2" />}
        </div>
    );
};
