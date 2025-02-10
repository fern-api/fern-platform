import { FC } from "react";

import clsx from "clsx";

import { BottomNavigationButton } from "./BottomNavigationButton";

interface BottomNavigationButtonsProps {
  next?: Omit<BottomNavigationButton.Props, "dir">;
  prev?: Omit<BottomNavigationButton.Props, "dir">;
  alwaysShowGrid?: boolean;
}

export const BottomNavigationButtons: FC<BottomNavigationButtonsProps> = ({
  prev,
  next,
  alwaysShowGrid,
}) => {
  if (prev == null && next == null) {
    return null;
  }

  const isGridEnabled = (prev != null && next != null) || alwaysShowGrid;

  return (
    <div
      className={
        isGridEnabled
          ? "not-prose grid grid-cols-2 gap-6 md:gap-8 lg:gap-12"
          : "not-prose grid grid-cols-1"
      }
    >
      {prev != null && <BottomNavigationButton {...prev} dir="prev" />}
      {next != null && (
        <BottomNavigationButton
          {...next}
          dir="next"
          className={clsx(
            isGridEnabled ? "col-start-2" : undefined,
            next.className
          )}
        />
      )}
    </div>
  );
};
