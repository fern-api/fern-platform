import cn from "clsx";
import { ReactElement, ReactNode } from "react";

export function StreamTag({ small = false, active = false }: { small?: boolean; active?: boolean }): ReactElement {
    return (
        <span
            className={cn("uppercase font-mono inline-flex justify-center items-center leading-none", {
                ["bg-accent/10 text-accent-aaa"]: !active,
                ["bg-accent t-accent-contrast"]: active,
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
