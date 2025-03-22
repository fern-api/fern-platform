"use client";

import {
  ComponentProps,
  MouseEventHandler,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  forwardRef,
  useCallback,
  useRef,
  useState,
} from "react";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { useResizeObserver } from "@fern-ui/react-commons";

import { cn } from "./cn";

export declare namespace FernProductDropdown {
  export interface ProductOption {
    type: "product";
    id: string;
    title: string;
    subtitle?: string;
    children?: ReactNode | ((active: boolean) => ReactNode);
    value: string;
    icon?: ReactNode;
    // tooltip?: ReactNode;
    className?: string;
    labelClassName?: string;
    href?: string;
  }

  export interface Props {
    className?: string;
    options: readonly ProductOption[];
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
      value,
      children,
      onOpen,
      usePortal = true,
      side,
      align,
      defaultOpen = false,
      dropdownMenuElement,
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
        {options.map((option, idx) => (
          <ProductDropdownOption
            key={option.id}
            option={option}
            value={value}
            dropdownMenuElement={dropdownMenuElement}
            container={container}
          />
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

function ProductDropdownOption({
  option,
  value,
  dropdownMenuElement,
  container,
}: {
  option: FernProductDropdown.ProductOption;
  value: string | undefined;
  dropdownMenuElement: ReactElement | undefined;
  container?: HTMLElement;
}) {
  const helperTextRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement & HTMLAnchorElement>(null);
  // useEffect(() => {
  //   if (option.value === value) {
  //     activeRef.current?.scrollIntoView({ block: "center" });
  //   }
  // }, [option.value, value]);

  const [isEllipsisActive, setIsEllipsisActive] = useState(false);
  useResizeObserver(helperTextRef, (entries) => {
    for (const entry of entries) {
      setIsEllipsisActive(entry.target.scrollWidth > entry.target.clientWidth);
    }
  });

  console.log("option", option);

  return (
    <div className={cn("fern-product-dropdown-item", option.className)}>
      <div className="fern-product-dropdown-item-icon">{option.icon}</div>

      <div className="flex flex-col">
        <p className="text-sm font-medium leading-tight">{option.title}</p>
        <p className="text-(color:--grayscale-a9) text-sm leading-tight">
          Lorem ipsum dolor sit amet, consectetur adipiscing
        </p>
        {option.subtitle ? (
          <p className="text-(color:--grayscale-a9) text-sm">
            {option.subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );

  // Note: we ignore href on the option if a custom dropdownMenuElement is not provided
  // return (
  //   <FernTooltip
  //     content={
  //       !isEllipsisActive ? (
  //         option.tooltip
  //       ) : (
  //         <div className="space-y-2">
  //           {option.helperText != null && <div>{option.helperText}</div>}
  //           {option.tooltip != null && <div>{option.tooltip}</div>}
  //         </div>
  //       )
  //     }
  //     side="right"
  //     sideOffset={8}
  //     container={container}
  //   >
  //     <DropdownMenu.RadioItem
  //       asChild={true}
  //       value={option.value}
  //       className="[&_svg]:size-icon data-[state=unchecked]:text-(color:--grayscale-a11 data-[highlighted]:data-[state=unchecked]:text-(color:--accent-contrast))"
  //     >
  //       {dropdownMenuElement != null ? (
  //         cloneElement(
  //           dropdownMenuElement,
  //           {
  //             ref: option.value === value ? activeRef : undefined,
  //             href: option.href,
  //             className: cn("fern-dropdown-item", option.className),
  //           } as any,
  //           renderButtonContent()
  //         )
  //       ) : (
  //         <button
  //           ref={option.value === value ? activeRef : undefined}
  //           className={cn("fern-dropdown-item", option.className)}
  //         >
  //           {renderButtonContent()}
  //         </button>
  //       )}
  //     </DropdownMenu.RadioItem>
  //   </FernTooltip>
  // );
}
