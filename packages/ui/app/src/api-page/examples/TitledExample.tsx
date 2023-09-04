import classNames from "classnames";
import { MouseEventHandler, useState } from "react";
import { CopyToClipboardButton } from "../../commons/CopyToClipboardButton";
import styles from "./TitledExample.module.scss";

export declare namespace TitledExample {
    export interface Props {
        title: string;
        type: "primary" | "warning";
        actions?: JSX.Element;
        className?: string;
        children: JSX.Element | ((parent: HTMLElement | undefined) => JSX.Element);
        onClick?: MouseEventHandler<HTMLDivElement>;
    }
}

export const TitledExample: React.FC<TitledExample.Props> = ({
    title,
    type,
    className,
    actions,
    children,
    onClick,
}) => {
    const [contentRef, setContentRef] = useState<HTMLElement | null>(null);

    return (
        <div
            className={classNames(
                "flex flex-col rounded-xl border border-border-default-light dark:border-border-default-dark overflow-hidden basis-full",
                className
            )}
            onClick={onClick}
        >
            <div
                className={classNames(
                    "border-border-default-light dark:border-border-default-dark flex h-10 items-center justify-between border-b py-1 pl-3 pr-2",
                    {
                        "bg-background-tertiary-light dark:bg-[#19181C]": type === "primary",
                        "bg-red-500/20": type === "warning",
                    }
                )}
            >
                <div className="flex items-center">
                    <div
                        className={classNames("text-xs uppercase tracking-wide", {
                            "t-muted": type === "primary",
                            "text-red-400": type === "warning",
                        })}
                    >
                        {title}
                    </div>
                </div>
                <div className="flex gap-2">
                    {actions}
                    <CopyToClipboardButton content={contentRef?.innerText} />
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
                        className="bg-background-primary-dark flex-1 overflow-auto whitespace-pre py-4"
                        ref={setContentRef}
                    >
                        {typeof children === "function" ? children(contentRef ?? undefined) : children}
                    </div>
                </div>
            </div>
        </div>
    );
};
