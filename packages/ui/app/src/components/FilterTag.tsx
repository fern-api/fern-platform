import clsx from "clsx";
import { ReactElement } from "react";

interface FilterTagProps {
    tagLabel: string;
    onClickHandler?: () => void;
    active: boolean;
}

export function FilterTag({ active, tagLabel, onClickHandler }: FilterTagProps): ReactElement {
    return (
        <span
            className={clsx(
                "text-xs text-nowrap cursor-pointer px-1.5 py-1 border border-black t-accent rounded-full max-h-6",
                {
                    "bg-accent text-white border-accent font-semibold": active,
                },
            )}
            onClick={onClickHandler}
        >
            {tagLabel}
        </span>
    );
}
