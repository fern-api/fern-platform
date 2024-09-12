import { FernButton, FernButtonProps } from "@fern-ui/components";
import * as Collapsible from "@radix-ui/react-collapsible";
import cn from "clsx";
import { Xmark } from "iconoir-react";
import { FC, PropsWithChildren, ReactNode } from "react";

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
    const text = !isOpen ? showText : hideText;

    return (
        <Collapsible.Root
            className="fern-collapse-card"
            open={isOpen}
            onOpenChange={(open) => {
                if (open) {
                    onOpen?.();
                } else {
                    onClose?.();
                }
            }}
        >
            <Collapsible.Trigger asChild>
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
                >
                    {text}
                </FernButton>
            </Collapsible.Trigger>
            <Collapsible.Content className="fern-collapse-card-content">{children}</Collapsible.Content>
        </Collapsible.Root>
    );
};
