import { FC, PropsWithChildren, ReactNode } from "react";

import {
  FernButton,
  FernButtonProps,
  FernCollapse,
} from "@fern-docs/components";
import cn from "clsx";
import { Xmark } from "iconoir-react";

interface FernCollapseWithButtonProps {
  isOpen: boolean;
  toggleIsOpen: () => void;
  onOpen?: () => void;
  onClose?: () => void;
  showText: ReactNode;
  hideText: ReactNode;
  buttonProps?: Partial<FernButtonProps>;
}

export const FernCollapseWithButton: FC<
  PropsWithChildren<FernCollapseWithButtonProps>
> = ({
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
    <FernCollapse
      className="fern-collapsible-card"
      open={isOpen}
      onOpenChange={(open) => {
        if (open) {
          onOpen?.();
        } else {
          onClose?.();
        }
      }}
      trigger={
        <FernButton
          {...buttonProps}
          className={cn(
            "fern-collapse-trigger text-left",
            buttonProps?.className
          )}
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
      }
    >
      {children}
    </FernCollapse>
  );
};
