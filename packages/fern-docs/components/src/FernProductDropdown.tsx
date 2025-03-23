"use client";

import {
  ComponentProps,
  MouseEventHandler,
  PropsWithChildren,
  ReactElement,
  forwardRef,
  useCallback,
  useState,
} from "react";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { FernDropdown } from "./FernDropdown";
import { FernProductDropdownItem } from "./FernProductDropdownItem";
import { cn } from "./cn";

export declare namespace FernProductDropdown {
  export interface Props {
    className?: string;
    options: readonly FernDropdown.ProductOption[];
    onValueChange?: (value: string) => void;
    value?: string;
    onOpen?: () => void;
    usePortal?: boolean;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    defaultOpen?: boolean;
    dropdownMenuElement?: ReactElement;
    container?: HTMLElement; // portal container
    onClick?: MouseEventHandler<HTMLDivElement> | undefined;
    contentProps?: ComponentProps<typeof DropdownMenu.Content> & {
      "data-testid"?: string;
    };
  }
}

export const FernProductDropdown = forwardRef<
  HTMLButtonElement,
  PropsWithChildren<FernProductDropdown.Props>
>(
  (
    {
      className,
      options,
      onValueChange,
      // value,
      children,
      onOpen,
      usePortal = true,
      side,
      align,
      defaultOpen = false,
      container,
      onClick,
      contentProps,
    },
    ref
  ): ReactElement => {
    const [isOpen, setOpen] = useState(defaultOpen);
    const handleOpenChange = useCallback(
      (toOpen: boolean) => {
        setOpen(toOpen);
        if (toOpen && onOpen != null) {
          onOpen();
        }
      },
      [onOpen]
    );
    const renderDropdownContent = () => (
      <DropdownMenu.Content
        sideOffset={4}
        collisionPadding={4}
        side={side}
        align={align}
        {...contentProps}
        className={cn("fern-product-dropdown", contentProps?.className)}
      >
        {options.map((option) => (
          <DropdownMenu.Item
            key={option.id}
            onClick={onClick}
            onSelect={onValueChange && (() => onValueChange(option.value))}
            className="hover:border-none"
          >
            <FernProductDropdownItem key={option.id} option={option} />
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    );

    return (
      <DropdownMenu.Root
        onOpenChange={handleOpenChange}
        open={isOpen}
        defaultOpen={defaultOpen}
      >
        <DropdownMenu.Trigger ref={ref} className={className}>
          {children}
        </DropdownMenu.Trigger>
        {usePortal ? (
          <DropdownMenu.Portal container={container}>
            {renderDropdownContent()}
          </DropdownMenu.Portal>
        ) : (
          renderDropdownContent()
        )}
      </DropdownMenu.Root>
    );
  }
);

FernProductDropdown.displayName = "ProductDropdown";
