import cn from "clsx";
import { ReactElement, ReactNode } from "react";
import { FernTooltip } from "../components/FernTooltip";

export function WssTag({ small = false }: { small?: boolean }): ReactElement {
    return (
        <FernTooltip content="WebSocket Channel">
            <span
                className={cn(
                    "uppercase font-mono flex items-center leading-none bg-accent-primary/10 dark:bg-accent-primary-dark/10 text-accent-primary dark:text-accent-primary-dark",
                    {
                        ["py-1 px-1.5 rounded-md h-5 text-[10px]"]: small,
                        ["py-1 px-2 rounded-lg h-6 text-xs"]: !small,
                    },
                )}
            >
                {"WSS"}
            </span>
        </FernTooltip>
    );
}

export function withWss(text: ReactNode, small?: boolean): ReactNode {
    return (
        <span className="inline-flex items-baseline gap-2">
            <span>{text}</span>
            <WssTag small={small} />
        </span>
    );
}
