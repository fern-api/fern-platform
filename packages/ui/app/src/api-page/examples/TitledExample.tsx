import classNames from "classnames";
import { MouseEventHandler, MutableRefObject, ReactElement, useState } from "react";
import { CopyToClipboardButton } from "../../commons/CopyToClipboardButton";

export declare namespace TitledExample {
    export interface Props {
        title: string;
        afterTitle?: ReactElement;
        type: "primary" | "warning";
        actions?: ReactElement;
        className?: string;
        children: ReactElement | ((parent: HTMLElement | undefined) => ReactElement);
        copyToClipboardText?: () => string; // use provider to lazily compute clipboard text
        onClick?: MouseEventHandler<HTMLDivElement>;
        containerRef?: MutableRefObject<HTMLDivElement | null>;
        disablePadding?: boolean;
    }
}

export const TitledExample: React.FC<TitledExample.Props> = ({
    title,
    afterTitle,
    type,
    className,
    actions,
    children,
    copyToClipboardText,
    onClick,
    containerRef,
    disablePadding = false,
}) => {
    const [contentRef, setContentRef] = useState<HTMLElement | null>(null);

    // innerText will not be available if the content is virtualized
    const copyToClipboardContent = copyToClipboardText ?? contentRef?.innerText;

    return (
        <div
            className={classNames(
                "flex flex-col rounded-lg border border-[#d7cfc1] overflow-visible bg-background-primary-light dark:bg-background-primary-dark",
                className
            )}
            onClick={onClick}
            ref={containerRef}
        >
            <div
                className={classNames(
                    "border-[#d7cfc1] rounded-t-lg flex h-10 items-center justify-between border-b py-1 pl-3 pr-2",
                    {
                        "bg-background/75 dark:bg-background-dark/75": type === "primary",
                        "bg-red-500/20": type === "warning",
                    }
                )}
            >
                <div className="flex items-baseline">
                    <span
                        className={classNames("inline-flex h-10 items-center text-sm font-semibold uppercase", {
                            "text-text-primary-light/60 dark:text-text-muted-dark": type === "primary",
                            "text-red-400": type === "warning",
                        })}
                    >
                        {title}
                    </span>
                    {afterTitle}
                </div>
                <div className="flex gap-2">
                    {actions}
                    <CopyToClipboardButton content={copyToClipboardContent} />
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
