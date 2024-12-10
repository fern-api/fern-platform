import { useCopyToClipboard } from "@fern-ui/react-commons";
import { composeEventHandlers } from "@radix-ui/primitive";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { Check, Copy } from "iconoir-react";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { Button } from "./FernButtonV2";
import { FernTooltip, FernTooltipProvider } from "./FernTooltip";
import { cn } from "./cn";

export const CopyToClipboardButton = forwardRef<
    HTMLButtonElement,
    Omit<ComponentPropsWithoutRef<"button">, "content"> & {
        content?: string | (() => string | Promise<string>);
        asChild?: boolean;
        size?: ComponentPropsWithoutRef<typeof Button>["size"];
        hideIcon?: boolean;
    }
>(({ className, content, children, asChild, hideIcon, ...props }, ref) => {
    const { copyToClipboard, wasJustCopied } = useCopyToClipboard(content);

    const Comp = asChild ? Slot : Button;

    return (
        <FernTooltipProvider>
            <FernTooltip
                content={wasJustCopied ? "Copied!" : "Copy to clipboard"}
                open={wasJustCopied ? true : undefined}
            >
                <Comp
                    size={hideIcon ? undefined : "icon"}
                    {...props}
                    ref={ref}
                    className={cn("group fern-copy-button", className)}
                    disabled={copyToClipboard == null}
                    onClick={composeEventHandlers(props.onClick, copyToClipboard, { checkForDefaultPrevented: true })}
                >
                    {hideIcon ? null : wasJustCopied ? <Check /> : <Copy />}
                    <Slottable>{children}</Slottable>
                </Comp>
            </FernTooltip>
        </FernTooltipProvider>
    );
});

CopyToClipboardButton.displayName = "CopyToClipboardButton";
