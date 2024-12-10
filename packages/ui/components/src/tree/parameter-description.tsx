import { Separator } from "@radix-ui/react-separator";
import { ComponentPropsWithoutRef, ReactNode, forwardRef } from "react";
import { CopyToClipboardButton } from "../CopyToClipboardButton";
import { Badge } from "../badges";
import { cn } from "../cn";
import { useDetailContext } from "./tree";

export const ParameterDescription = forwardRef<
    HTMLDivElement,
    ComponentPropsWithoutRef<"div"> & {
        parameterName: string;
        typeShorthand: ReactNode;
        required?: boolean;
    }
>(({ parameterName, typeShorthand, required, ...props }, ref) => {
    const { setOpen } = useDetailContext();

    return (
        <div
            ref={ref}
            {...props}
            className={cn("inline-flex items-baseline group/trigger justify-start gap-3", props.className)}
        >
            <CopyToClipboardButton
                content={parameterName}
                asChild
                hideIcon
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen(true);
                }}
            >
                <Badge color="accent" variant="ghost" rounded interactive className="-mx-2 font-mono">
                    {parameterName}
                </Badge>
            </CopyToClipboardButton>
            <span className="text-[var(--grayscale-a9)] text-xs">{typeShorthand}</span>
            <Separator
                orientation="horizontal"
                decorative
                className="inline-block mx-1 flex-1 w-10 h-0 border-b border-dashed border-[var(--grayscale-a6)] self-center invisible group-hover/trigger:visible"
            />
            <span className={cn("text-xs", required ? "text-[var(--red-a11)]" : "text-[var(--grayscale-a9)]")}>
                {required ? "required" : "optional"}
            </span>
        </div>
    );
});

ParameterDescription.displayName = "ParameterDescription";
