import cn from "clsx";
import { FC, type PropsWithChildren } from "react";

export declare namespace ColumnGroup {
  export interface ItemProps {
    span?: number; // default 1, max 6
  }

  export interface Props {
    cols?: number; // default 2, max 6
  }
}

export const ColumnGroup: FC<PropsWithChildren<ColumnGroup.Props>> = ({
  children,
  cols = 2,
}) => {
  return (
    <div
      className={cn("grid gap-4 sm:gap-6 mb-6 mt-4 first:mt-0", {
        "grid-cols-1": cols <= 1,
        "grid-cols-1 sm:grid-cols-2": cols === 2,
        "grid-cols-1 sm:grid-cols-2 md:grid-cols-3": cols === 3,
        "grid-cols-1 sm:grid-cols-2 md:grid-cols-4": cols === 4,
        "grid-cols-1 sm:grid-cols-2 md:grid-cols-5": cols === 5,
        "grid-cols-1 sm:grid-cols-2 md:grid-cols-6": cols >= 6,
      })}
    >
      {children}
    </div>
  );
};

export const Column: FC<PropsWithChildren<ColumnGroup.ItemProps>> = ({
  children,
  span = 1,
}) => {
  return (
    <div
      className={cn({
        "col-span-1": span === 1,
        "col-span-1 sm:col-span-2": span === 2,
        "col-span-1 sm:col-span-2 md:col-span-3": span === 3,
        "col-span-1 sm:col-span-2 md:col-span-4": span === 4,
        "col-span-1 sm:col-span-2 md:col-span-5": span === 5,
        "col-span-1 sm:col-span-2 md:col-span-6": span >= 6,
      })}
    >
      {children}
    </div>
  );
};
