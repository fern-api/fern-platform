import { FernButton, FernButtonProps, FernCollapse } from "@fern-ui/components";
import cn from "clsx";
import { Xmark } from "iconoir-react";
import { FC, PropsWithChildren, ReactNode, useState } from "react";

interface FernCollapseWithButtonProps {
    isOpen: boolean;
    toggleIsOpen: () => void;
    onOpen?: () => void;
    onClose?: () => void;
    showText: ReactNode;
    hideText: ReactNode;
    buttonProps?: Partial<FernButtonProps>;
}

export const FernCollapseWithButton: FC<PropsWithChildren<FernCollapseWithButtonProps>> = ({
    isOpen,
    toggleIsOpen,
    onOpen,
    onClose,
    children,
    showText,
    hideText,
    buttonProps,
}) => {
    const [isFullWidth, setFullWidth] = useState(isOpen);
    const [transition, setTransition] = useState<"closed" | "open" | "closing" | "opening">(isOpen ? "open" : "closed");

    const text = !isOpen ? showText : hideText;

    return (
        <div
            className={cn(
                "fern-collapse-with-button data-[state=opening]:overflow-hidden data-[state=closing]:overflow-hidden",
                "ring-default flex flex-col max-md:rounded-xl rounded-lg ring-1 m-px",
                {
                    "w-full": isFullWidth,
                    "w-fit max-sm:w-full": !isFullWidth,
                },
            )}
            data-state={transition}
        >
            <FernButton
                {...buttonProps}
                className={cn("fern-collapse-trigger text-left", buttonProps?.className)}
                onClick={(e) => {
                    toggleIsOpen();
                    e.stopPropagation();
                }}
                variant="minimal"
                icon={
                    typeof text === "string" ? (
                        <Xmark
                            className={cn("transition", {
                                "rotate-45": !isOpen,
                            })}
                        />
                    ) : null
                }
                active={isOpen}
                data-state={transition}
            >
                {text}
            </FernButton>
            <FernCollapse
                className="border-default -mt-px border-t"
                isOpen={isOpen}
                onOpenStart={() => {
                    setFullWidth(true);
                    setTransition("opening");
                    onOpen?.();
                }}
                onOpenEnd={() => {
                    setTransition("open");
                }}
                onCloseStart={() => {
                    setTransition("closing");
                    onClose?.();
                }}
                onCloseEnd={() => {
                    setFullWidth(false);
                    setTransition("closed");
                }}
            >
                {children}
            </FernCollapse>
        </div>
    );
};
