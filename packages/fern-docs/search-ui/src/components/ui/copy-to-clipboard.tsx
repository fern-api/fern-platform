import { composeEventHandlers } from "@radix-ui/primitive";
import { Slot } from "@radix-ui/react-slot";
import { TooltipPortal } from "@radix-ui/react-tooltip";
import { Copy } from "lucide-react";
import {
    ComponentPropsWithoutRef,
    forwardRef,
    useEffect,
    useRef,
    useState,
} from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./tooltip";

export const CopyToClipboard = forwardRef<
    HTMLButtonElement,
    Omit<ComponentPropsWithoutRef<"button">, "content"> & {
        asChild?: boolean;
        content: string | (() => string | Promise<string>);
        duration?: number;
    }
>(({ asChild, content, duration = 2_000, ...props }, ref) => {
    const interval = useRef<number>();
    const [copied, setCopied] = useState(false);
    const Comp = asChild ? Slot : "button";
    useEffect(() => {
        return () => {
            if (interval.current) {
                window.clearTimeout(interval.current);
            }
        };
    }, []);
    return (
        <TooltipProvider>
            <Tooltip open={copied}>
                <TooltipTrigger asChild>
                    <Comp
                        ref={ref}
                        {...props}
                        onClick={composeEventHandlers(
                            props.onClick,
                            async () => {
                                if (interval.current) {
                                    window.clearTimeout(interval.current);
                                }
                                const resolvedContent =
                                    typeof content === "function"
                                        ? await content()
                                        : content;
                                await navigator.clipboard.writeText(
                                    resolvedContent
                                );
                                setCopied(true);
                                interval.current = window.setTimeout(() => {
                                    setCopied(false);
                                }, duration);
                            },
                            { checkForDefaultPrevented: true }
                        )}
                    >
                        {props.children ?? <Copy />}
                    </Comp>
                </TooltipTrigger>
                <TooltipPortal>
                    <TooltipContent>
                        <p>Copied!</p>
                    </TooltipContent>
                </TooltipPortal>
            </Tooltip>
        </TooltipProvider>
    );
});

CopyToClipboard.displayName = "CopyToClipboard";
