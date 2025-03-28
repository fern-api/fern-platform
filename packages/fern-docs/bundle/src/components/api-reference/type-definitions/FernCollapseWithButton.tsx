import { FC, PropsWithChildren, ReactNode } from "react";

import { X } from "lucide-react";

import { cn } from "@fern-docs/components";
import {
  FernButton,
  FernButtonProps,
  FernCollapse,
} from "@fern-docs/components";

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
              <X
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
