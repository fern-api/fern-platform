import classNames from "classnames";
import { MouseEventHandler, MutableRefObject, ReactElement, useState } from "react";
import { CopyToClipboardButton } from "../../commons/CopyToClipboardButton";
import styles from "./TitledExample.module.scss";

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
                "flex flex-col rounded-lg border border-[#E2E8F0] overflow-visible bg-white basis-full",
                className
            )}
            style={{ boxShadow: "rgba(22, 22, 22, 0.06) 0px 4px 8px 0px, rgba(22, 22, 22, 0.12) 0px 0px 1px 0px" }}
            onClick={onClick}
            ref={containerRef}
        >
            <div
                className={classNames(
                    "border-[#E2E8F0] rounded-t-lg  flex h-10 items-center justify-between border-b py-1 pl-3 pr-2",
                    {
                        // "bg-gray-200/90 dark:bg-[#19181C]": type === "primary",
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
                        className={classNames("flex-1 overflow-hidden whitespace-pre", {
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
