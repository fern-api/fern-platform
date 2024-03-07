import classNames from "classnames";
import { forwardRef, MouseEventHandler, PropsWithChildren, ReactElement, ReactNode } from "react";
import { CopyToClipboardButton } from "../../syntax-highlighting/CopyToClipboardButton";

export declare namespace TitledExample {
    export interface Props {
        title: ReactNode;
        type: "primary" | "warning";
        actions?: ReactElement;
        className?: string;
        copyToClipboardText?: () => string; // use provider to lazily compute clipboard text
        onClick?: MouseEventHandler<HTMLDivElement>;
        disableClipboard?: boolean;
        onMouseOver?: MouseEventHandler<HTMLDivElement>;
        onMouseOut?: MouseEventHandler<HTMLDivElement>;
    }
}

export const TitledExample = forwardRef<HTMLDivElement, PropsWithChildren<TitledExample.Props>>(function TitledExample(
    { title, type, className, actions, children, copyToClipboardText, onClick, disableClipboard = false },
    ref,
) {
    return (
        <div
            className={classNames(
                "rounded-xl flex flex-col bg-card after:ring-default after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:content-[''] relative shadow-sm",
                className,
            )}
            onClick={onClick}
            ref={ref}
        >
            <div
                className={classNames("rounded-t-xl h-10", {
                    "bg-tag-default-soft": type === "primary",
                    "bg-tag-danger-soft": type === "warning",
                })}
            >
                <div className="shadow-border-default mx-px flex min-h-10 items-center justify-between rounded-t-xl px-2 shadow-[inset_0_-1px_0_0]">
                    {typeof title === "string" ? (
                        <div
                            className={classNames("text-xs uppercase px-1", {
                                "t-muted": type === "primary",
                                "t-danger": type === "warning",
                            })}
                        >
                            {title}
                        </div>
                    ) : (
                        <div className="min-w-0 flex-1 shrink">{title}</div>
                    )}
                    <div className="flex gap-2">
                        {actions}
                        {!disableClipboard && <CopyToClipboardButton content={copyToClipboardText} className="-m-1" />}
                    </div>
                </div>
            </div>
            {children}
        </div>
    );
});
