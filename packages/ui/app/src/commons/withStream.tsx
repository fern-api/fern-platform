import cn from "clsx";
import { ReactElement, ReactNode } from "react";

export function StreamTag({ small = false }: { small?: boolean }): ReactElement {
    return (
        <span
            className={cn(
                "uppercase font-mono flex items-center leading-none bg-accent-primary/10 dark:bg-accent-primary-dark/10 text-accent-primary dark:text-accent-primary-dark",
                {
                    ["py-1 px-1.5 rounded-md h-5 text-[10px]"]: small,
                    ["py-1 px-2 rounded-lg h-6 text-xs"]: !small,
                },
            )}
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
