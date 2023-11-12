import classNames from "classnames";
import { MouseEventHandler, MutableRefObject, useState } from "react";
import { CopyToClipboardButton } from "../../commons/CopyToClipboardButton";
import styles from "./TitledExample.module.scss";

export declare namespace TitledExample {
    export interface Props {
        title: string;
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
                "flex flex-col rounded-xl border border-[rgb(215,207,193)] overflow-visible basis-full",
                className
            )}
            onClick={onClick}
            ref={containerRef}
        >
            <div
                className={classNames(
                    "border-[rgb(215,207,193)] rounded-t-xl  flex h-10 items-center justify-between border-b py-1 pl-3 pr-2",
                    {
                        "bg-[#F5F4F2]": type === "primary",
                        "bg-red-500/20": type === "warning",
                    }
                )}
            >
                <div className="flex items-center">
                    <div
                        className={classNames("text-xs uppercase tracking-wide", {
                            "text-text-primary-light dark:text-text-muted-dark": type === "primary",
                            "text-red-400": type === "warning",
                        })}
                    >
                        {title}
                    </div>
                </div>
                <div className="flex gap-2">
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
                        className={classNames("flex-1 overflow-hidden rounded-b-xl whitespace-pre bg-white", {
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
