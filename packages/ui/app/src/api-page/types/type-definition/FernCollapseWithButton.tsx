import { Cross2Icon } from "@radix-ui/react-icons";
import classNames from "classnames";
import { FC, PropsWithChildren, ReactNode, useState } from "react";
import { FernButton, FernButtonProps } from "../../../components/FernButton";
import { FernCollapse } from "../../../components/FernCollapse";
import "./FernCollapseWithButton.scss";

interface FernCollapseWithButtonProps {
    isOpen: boolean;
    toggleIsOpen: () => void;
    showText: ReactNode;
    hideText: ReactNode;
    buttonProps?: Partial<FernButtonProps>;
}

export const FernCollapseWithButton: FC<PropsWithChildren<FernCollapseWithButtonProps>> = ({
    isOpen,
    toggleIsOpen,
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
            className={classNames(
                "fern-collapse-with-button",
                "ring-border-default flex flex-col rounded-lg ring-1 ring-inset divide-border-default divide-y",
                {
                    "w-full": isFullWidth,
                    "w-fit max-sm:w-full": !isFullWidth,
                },
            )}
            data-state={isOpen ? "open" : "closed"}
        >
            <FernButton
                {...buttonProps}
                className={classNames("fern-collapse-trigger text-left", buttonProps?.className)}
                onClick={(e) => {
                    toggleIsOpen();
                    e.stopPropagation();
                }}
                variant="minimal"
                icon={
                    typeof text === "string" ? (
                        <Cross2Icon
                            className={classNames("transition", {
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
                isOpen={isOpen}
                onOpenStart={() => {
                    setFullWidth(true);
                    setTransition("opening");
                }}
                onOpenEnd={() => {
                    setTransition("open");
                }}
                onCloseStart={() => {
                    setTransition("closing");
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
