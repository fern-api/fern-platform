import { PropsWithChildren } from "react";

export function Tag({ children }: PropsWithChildren<unknown>): JSX.Element {
    return (
        <div className="t-muted bg-tag-default-light dark:bg-tag-default-dark flex shrink-0 items-center justify-center rounded-lg px-2 py-1 text-xs font-normal uppercase">
            {children}
        </div>
    );
}
