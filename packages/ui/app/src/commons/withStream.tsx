import classNames from "classnames";
import { ReactNode } from "react";

export function withStream(text: ReactNode): ReactNode {
    return (
        <span className="inline-flex items-baseline gap-2">
            <span>{text}</span>
            <span
                className={classNames(
                    "uppercase font-mono flex items-center text-xs leading-none bg-accent-primary/10 dark:bg-accent-primary-dark/10 text-accent-primary dark:text-accent-primary-dark p-0.5 rounded-[4px]",
                )}
            >
                {"STREAM"}
            </span>
        </span>
    );
}
