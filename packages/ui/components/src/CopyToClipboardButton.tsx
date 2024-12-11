import { useCopyToClipboard } from "@fern-ui/react-commons";
import { composeEventHandlers } from "@radix-ui/primitive";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { Check, Copy } from "iconoir-react";
import { ComponentPropsWithoutRef, ReactNode, forwardRef } from "react";
import { Button } from "./FernButtonV2";
import { FernTooltip, FernTooltipProvider } from "./FernTooltip";
import { cn } from "./cn";

export const CopyToClipboardButton = forwardRef<
    HTMLButtonElement,
    Omit<ComponentPropsWithoutRef<"button">, "content"> & {
        content?: string | (() => string | Promise<string>);
        tooltipContent?: ReactNode | ((props: { copyToClipboard: undefined | (() => void) }) => ReactNode);
        asChild?: boolean;
        tooltipContentAsChild?: boolean;
        size?: ComponentPropsWithoutRef<typeof Button>["size"];
        hideIcon?: boolean;
        delayDuration?: number;
    }
>(
    (
        {
            className,
            content,
            tooltipContent,
            children,
            asChild,
            tooltipContentAsChild,
            hideIcon,
            delayDuration,
            ...props
        },
        ref,
    ) => {
        const { copyToClipboard, wasJustCopied } = useCopyToClipboard(content);

        const Comp = asChild ? Slot : Button;

        return (
            <FernTooltipProvider>
                <FernTooltip
                    content={
                        wasJustCopied ? (
                            "Copied!"
                        ) : tooltipContent != null ? (
                            typeof tooltipContent === "function" ? (
                                tooltipContent({ copyToClipboard })
                            ) : (
                                tooltipContent
                            )
                        ) : (
                            <p>{"Copy to clipboard"}</p>
                        )
                    }
                    open={wasJustCopied ? true : undefined}
                    asChild
                    contentAsChild={tooltipContentAsChild}
                    delayDuration={delayDuration}
                >
                    <Comp
                        size={hideIcon ? undefined : "icon"}
                        {...props}
                        ref={ref}
                        className={cn("group fern-copy-button", className)}
                        disabled={copyToClipboard == null}
                        onClick={composeEventHandlers(props.onClick, copyToClipboard, {
                            checkForDefaultPrevented: true,
                        })}
                    >
                        {hideIcon ? null : wasJustCopied ? <Check /> : <Copy />}
                        <Slottable>{children}</Slottable>
                    </Comp>
                </FernTooltip>
            </FernTooltipProvider>
        );
    },
);

CopyToClipboardButton.displayName = "CopyToClipboardButton";
