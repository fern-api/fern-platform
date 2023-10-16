import classNames from "classnames";
import { MouseEventHandler, MutableRefObject, useState } from "react";
import { CopyToClipboardButton } from "../../commons/CopyToClipboardButton";
import styles from "./TitledExample.module.scss";

export declare namespace TitledExample {
    export interface Props {
        title: string | JSX.Element;
        tag?: string;
        type: "primary" | "warning";
        actions?: JSX.Element;
        className?: string;
        children: JSX.Element | ((parent: HTMLElement | undefined) => JSX.Element);
        copyToClipboardText?: () => string; // use provider to lazily compute clipboard text
        onClick?: MouseEventHandler<HTMLDivElement>;
        containerRef?: MutableRefObject<HTMLDivElement | null>;
        disablePadding?: boolean;
    }
}

export const TitledExample: React.FC<TitledExample.Props> = ({
    title,
    tag,
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
                "flex flex-col rounded-xl border border-gray-100/90 dark:border-white/10 overflow-visible basis-full",
                className
            )}
            onClick={onClick}
            ref={containerRef}
        >
            <div
                className={classNames(
                    "border-gray-100/90 rounded-t-xl dark:border-white/10 flex h-10 items-center justify-between border-b px-4",
                    {
                        "bg-red-500/20": type === "warning",
                    }
                )}
            >
                <div className="flex items-center">
                    <div
                        className={classNames("text-xs font-semibold uppercase tracking-wide", {
                            "text-text-primary-light dark:text-text-muted-dark": type === "primary",
                            "text-red-400": type === "warning",
                        })}
                    >
                        <span>{title}</span>
                        {tag != null && (
                            <span className={"ml-2 rounded bg-gray-100/90 px-1.5 py-1 dark:bg-white/10"}>{tag}</span>
                        )}
                    </div>
                </div>
                <div className="flex gap-3">
                    {actions}
                    <CopyToClipboardButton content={copyToClipboardContent} />
                </div>
            </div>
            <div className="flex min-h-0 flex-1">
                <div
                    className={classNames(
                        styles.code,
                        className,
                        "flex flex-1 leading-relaxed text-xs min-w-0",
                        "typography-font-code"
                    )}
                >
                    <div
                        className={classNames(
                            "dark:bg-white/10 flex-1 overflow-hidden rounded-b-xl whitespace-pre bg-gray-100/90",
                            {
                                "py-4": !disablePadding,
                            }
                        )}
                        ref={setContentRef}
                    >
                        {typeof children === "function" ? children(contentRef ?? undefined) : children}
                    </div>
                </div>
            </div>
        </div>
    );
};
