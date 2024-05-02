import cn from "clsx";
import { ReactElement, ReactNode } from "react";

export function StreamTag({ small = false, active = false }: { small?: boolean; active?: boolean }): ReactElement {
    return (
        <span
            className={cn("uppercase font-mono inline-flex justify-center items-center leading-none", {
                ["bg-accent-primary/10 dark:bg-accent-primary-dark/10 text-accent-primary-aaa"]: !active,
                ["bg-accent-primary dark:bg-accent-primary-dark t-accent-contrast"]: active,
                ["rounded-md h-[18px] text-[10px] w-9"]: small,
                ["py-1 px-2 rounded-lg h-6 text-xs"]: !small,
            })}
        >
            {"STREAM"}
        </span>
    );
}

export function withStream(text: ReactNode, small?: boolean): ReactNode {
    return (
        <span className="inline-flex items-baseline gap-2">
            <span>{text}</span>
            <StreamTag small={small} />
        </span>
    );
}
