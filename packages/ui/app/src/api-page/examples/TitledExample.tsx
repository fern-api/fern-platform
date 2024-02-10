import classNames from "classnames";
import { MouseEventHandler, MutableRefObject, ReactElement, useState } from "react";
import { CopyToClipboardButton } from "../../commons/CopyToClipboardButton";

export declare namespace TitledExample {
    export interface Props {
        title: string;
        type: "primary" | "warning";
        actions?: ReactElement;
        className?: string;
        children: ReactElement | ((parent: HTMLElement | undefined) => ReactElement);
        copyToClipboardText?: () => string; // use provider to lazily compute clipboard text
        onClick?: MouseEventHandler<HTMLDivElement>;
        containerRef?: MutableRefObject<HTMLDivElement | null>;
        disablePadding?: boolean;
        disableClipboard?: boolean;
    }
}

export const TitledExample: React.FC<TitledExample.Props> = ({
    title,
    type,
    className,
    actions,
    children,
    copyToClipboardText,
    onClick,
    containerRef,
    disablePadding = false,
    disableClipboard = false,
}) => {
    const [contentRef, setContentRef] = useState<HTMLElement | null>(null);

    // innerText will not be available if the content is virtualized
    const copyToClipboardContent = copyToClipboardText ?? contentRef?.innerText;

    return (
        <div
            className={classNames(
                "flex flex-col rounded-xl border border-black/20 dark:border-white/20 overflow-visible basis-full bg-background",
                className,
            )}
            onClick={onClick}
            ref={containerRef}
        >
            <div
                className={classNames(
                    "border-black/20 rounded-t-xl dark:border-white/20 flex h-10 items-center justify-between border-b py-1 pl-3 pr-2",
                    {
                        "bg-black/5 dark:bg-white/5": type === "primary",
                        "bg-red-500/20": type === "warning",
                    },
                )}
            >
                <div className="flex items-center">
                    <div
                        className={classNames("text-xs uppercase tracking-wide", {
                            "t-muted": type === "primary",
                            "t-danger": type === "warning",
                        })}
                    >
                        {title}
                    </div>
                </div>
                <div className="flex gap-2">
                    {actions}
                    {!disableClipboard && <CopyToClipboardButton content={copyToClipboardContent} className="-m-1" />}
                </div>
            </div>
            <div className="flex min-h-0 flex-1">
                <div className={classNames(className, "flex flex-1 leading-relaxed text-xs min-w-0 font-mono")}>
                    <div
                        className={classNames("flex-1 overflow-hidden rounded-b-xl whitespace-pre", {
                            "py-4": !disablePadding,
                        })}
                        ref={setContentRef}
                    >
                        {typeof children === "function" ? children(contentRef ?? undefined) : children}
                    </div>
                </div>
            </div>
        </div>
    );
};
