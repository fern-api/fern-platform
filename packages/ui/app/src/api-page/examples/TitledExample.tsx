import { FernButton, FernTooltip, FernTooltipProvider, Intent } from "@fern-ui/components";
import Brightness6Icon from "@mui/icons-material/Brightness6";
import cn from "clsx";
import { atom, useAtom } from "jotai";
import { MouseEventHandler, PropsWithChildren, ReactNode, forwardRef } from "react";
import { CopyToClipboardButton } from "../../syntax-highlighting/CopyToClipboardButton";

export declare namespace TitledExample {
    export interface Props {
        title: ReactNode;
        intent?: Intent;
        actions?: ReactNode;
        className?: string;
        copyToClipboardText?: () => string; // use provider to lazily compute clipboard text
        onClick?: MouseEventHandler<HTMLDivElement>;
        disableClipboard?: boolean;
        onMouseOver?: MouseEventHandler<HTMLDivElement>;
        onMouseOut?: MouseEventHandler<HTMLDivElement>;
    }
}

const DARK_CODE_ENABLED = atom(false);

export const TitledExample = forwardRef<HTMLDivElement, PropsWithChildren<TitledExample.Props>>(function TitledExample(
    { title, intent = "none", className, actions, children, copyToClipboardText, onClick, disableClipboard = false },
    ref,
) {
    const [isDarkCodeEnabled, setDarkCodeEnabled] = useAtom(DARK_CODE_ENABLED);
    return (
        <div
            className={cn(
                "overflow-hidden flex flex-col bg-card relative border border-default rounded-lg",
                "max-md:max-h-vh-minus-header-padded",
                className,
                { "code-dark": isDarkCodeEnabled },
            )}
            onClick={onClick}
            ref={ref}
        >
            <div
                className={cn("h-12 border-b border-default flex items-center shrink-0", {
                    "bg-white": intent === "none" || intent === "primary",
                    "bg-tag-warning-soft": intent === "warning",
                    "bg-tag-success-soft": intent === "success",
                    "bg-tag-danger-soft": intent === "danger",
                })}
            >
                <div className={"min-w-0 flex-1 shrink self-stretch flex items-center px-3"}>{title}</div>
                <div className="flex gap-0 px-2 items-center">
                    {actions}
                    <FernTooltipProvider>
                        <FernTooltip content={isDarkCodeEnabled ? "Light mode theme" : "Dark mode theme"} side="top">
                            <FernButton
                                icon={<Brightness6Icon />}
                                rounded
                                variant="minimal"
                                onClick={() => setDarkCodeEnabled((prev) => !prev)}
                            />
                        </FernTooltip>
                    </FernTooltipProvider>
                    {!disableClipboard && <CopyToClipboardButton content={copyToClipboardText} />}
                </div>
            </div>
            {children}
        </div>
    );
});
