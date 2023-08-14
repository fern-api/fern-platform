import classNames from "classnames";
import { MouseEventHandler, useState } from "react";
import { CheckIcon } from "../../commons/icons/CheckIcon";
import { CopyIcon } from "../../commons/icons/CopyIcon";
import styles from "./TitledExample.module.scss";
import { useCopyToClipboard } from "./useCopyToClipboard";

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

    const { copyToClipboard, wasJustCopied } = useCopyToClipboard(contentRef?.innerText);

    return (
        <div
            className={classNames(
                "flex flex-col bg-background-primary-light dark:bg-background-primary-dark rounded-xl border border-border-default-light dark:border-border-default-dark overflow-hidden basis-full",
                className
            )}
            onClick={onClick}
        >
            <div
                className={classNames(
                    "border-border-default-light dark:border-border-default-dark flex h-10 items-center justify-between border-b py-1 pl-3 pr-2",
                    {
                        "bg-background-tertiary-light dark:bg-background-tertiary-dark": type === "primary",
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
                    <button onClick={copyToClipboard} disabled={copyToClipboard == null}>
                        {wasJustCopied ? (
                            <div className="bg-tag-primary flex h-4 w-4 items-center justify-center rounded-sm">
                                <CheckIcon className="text-accent-primary h-4 w-4" />
                            </div>
                        ) : (
                            <CopyIcon className="text-intent-default hover:text-text-primary-light hover:dark:text-text-primary-dark h-4 w-4" />
                        )}
                    </button>
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
                    <div className="flex-1 overflow-auto whitespace-pre py-4" ref={setContentRef}>
                        {typeof children === "function" ? children(contentRef ?? undefined) : children}
                    </div>
                </div>
            </div>
        </div>
    );
};
