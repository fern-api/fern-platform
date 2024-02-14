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
                "rounded-xl flex flex-col bg:white dark:bg-tag-default-soft after:ring-border-default after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:content-[''] relative shadow-sm",
                className,
            )}
            onClick={onClick}
            ref={containerRef}
        >
            <div
                className={classNames("rounded-t-xl h-10", {
                    "bg-tag-default-soft": type === "primary",
                    "bg-tag-danger-soft": type === "warning",
                })}
            >
                <div className="shadow-border-default mx-px flex min-h-10 items-center justify-between rounded-t-xl px-1 shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.1)]">
                    <div
                        className={classNames("text-xs uppercase px-2", {
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
