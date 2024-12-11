import * as Separator from "@radix-ui/react-separator";
import { Children, ComponentPropsWithoutRef, Fragment, forwardRef, isValidElement } from "react";
import { cn } from "../cn";

export const UnionVariants = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(
    ({ children, ...props }, ref) => {
        const childrenArray = Children.toArray(children);
        return (
            <div
                ref={ref}
                {...props}
                className={cn("border border-[var(--grayscale-a6)] rounded-xl -mx-2", props.className)}
            >
                {childrenArray.map((child, index) => (
                    <Fragment key={isValidElement(child) ? child.key ?? index : index}>
                        {index > 0 && (
                            <Separator.Root
                                orientation="horizontal"
                                className="flex items-center gap-2 h-px pointer-events-none"
                            >
                                <Separator.Separator className="flex-1 h-px bg-[var(--grayscale-a6)]" />
                                <span className="text-[var(--grayscale-a9)] text-sm uppercase">{"or"}</span>
                                <Separator.Separator className="flex-1 h-px bg-[var(--grayscale-a6)]" />
                            </Separator.Root>
                        )}
                        <div className="py-2 px-4">{child}</div>
                    </Fragment>
                ))}
            </div>
        );
    },
);

UnionVariants.displayName = "UnionVariants";
