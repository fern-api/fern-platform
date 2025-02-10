import {
  ComponentProps,
  MouseEventHandler,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  cloneElement,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useResizeObserver } from "@fern-ui/react-commons";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import cn, { clsx } from "clsx";
import { Check, InfoCircle } from "iconoir-react";

import { FernScrollArea } from "./FernScrollArea";
import { FernTooltip, FernTooltipProvider } from "./FernTooltip";

export declare namespace FernDropdown {
  export interface ValueOption {
    type: "value";
    label?: ReactNode;
    helperText?: ReactNode;
    children?: ReactNode | ((active: boolean) => ReactNode);
    value: string;
    icon?: ReactNode;
    rightElement?: ReactNode;
    tooltip?: ReactNode;
    className?: string;
    labelClassName?: string;
    href?: string;
  }
  export interface SeparatorOption {
    type: "separator";
  }

  export type Option = ValueOption | SeparatorOption;

  export interface Props {
    options: Option[];
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

export const FernDropdown = forwardRef<
  HTMLButtonElement,
  PropsWithChildren<FernDropdown.Props>
>(
  (
    {
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
        side={side}
        align={align}
        {...contentProps}
        className={clsx("fern-dropdown", contentProps?.className)}
      >
        <FernTooltipProvider>
          <FernScrollArea
            rootClassName="min-h-0 shrink"
            className="p-1"
            scrollbars="vertical"
          >
            <DropdownMenu.RadioGroup
              value={value}
              onValueChange={onValueChange}
              onClick={onClick}
            >
              {options.map((option, idx) =>
                option.type === "value" ? (
                  <FernDropdownItemValue
                    key={option.value}
                    option={option}
                    value={value}
                    dropdownMenuElement={dropdownMenuElement}
                    container={container}
                  />
                ) : (
                  <DropdownMenu.Separator
                    key={idx}
                    className="bg-border-default mx-2 my-1 h-px"
                  />
                )
              )}
            </DropdownMenu.RadioGroup>
          </FernScrollArea>
        </FernTooltipProvider>
      </DropdownMenu.Content>
    );

    return (
      <DropdownMenu.Root
        onOpenChange={handleOpenChange}
        open={isOpen}
        modal={false}
        defaultOpen={defaultOpen}
      >
        <DropdownMenu.Trigger asChild={true} ref={ref}>
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

FernDropdown.displayName = "FernDropdown";

function FernDropdownItemValue({
  option,
  value,
  dropdownMenuElement,
  container,
}: {
  option: FernDropdown.ValueOption;
  value: string | undefined;
  dropdownMenuElement: ReactElement | undefined;
  container?: HTMLElement;
}) {
  const helperTextRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement & HTMLAnchorElement>(null);
  useEffect(() => {
    if (option.value === value) {
      activeRef.current?.scrollIntoView({ block: "center" });
    }
  }, [option.value, value]);

  const [isEllipsisActive, setIsEllipsisActive] = useState(false);
  useResizeObserver(helperTextRef, (entries) => {
    for (const entry of entries) {
      setIsEllipsisActive(entry.target.scrollWidth > entry.target.clientWidth);
    }
  });

  function renderButtonContent() {
    return (
      <div className="w-full">
        <div className="flex items-center">
          <span className="fern-dropdown-item-indicator">
            {value != null && (
              <DropdownMenu.ItemIndicator asChild={true}>
                <Check />
              </DropdownMenu.ItemIndicator>
            )}
          </span>

          {option.icon && (
            <span className="mr-2 inline-flex items-center">{option.icon}</span>
          )}

          <div className={option.labelClassName}>
            {option.label ?? option.value}
          </div>
          <span className="ml-auto space-x-1 pl-2">
            {option.rightElement && <span>{option.rightElement}</span>}
            {(isEllipsisActive ||
              (option.tooltip != null && option.tooltip !== "")) && (
              <InfoCircle className="size-icon" />
            )}
          </span>
        </div>

        {option.helperText != null && (
          <div
            className="ml-5 mt-0.5 text-start text-xs leading-snug opacity-60"
            ref={helperTextRef}
          >
            {option.helperText}
          </div>
        )}
      </div>
    );
  }

  // Note: we ignore href on the option if a custom dropdownMenuElement is not provided
  return (
    <FernTooltip
      content={
        !isEllipsisActive ? (
          option.tooltip
        ) : (
          <div className="space-y-2">
            {option.helperText != null && <div>{option.helperText}</div>}
            {option.tooltip != null && <div>{option.tooltip}</div>}
          </div>
        )
      }
      side="right"
      sideOffset={8}
      container={container}
    >
      <DropdownMenu.RadioItem asChild={true} value={option.value}>
        {dropdownMenuElement != null ? (
          cloneElement(
            dropdownMenuElement,
            {
              ref: option.value === value ? activeRef : undefined,
              href: option.href,
              className: cn("fern-dropdown-item", option.className),
            } as any,
            renderButtonContent()
          )
        ) : (
          <button
            ref={option.value === value ? activeRef : undefined}
            className={cn("fern-dropdown-item", option.className)}
          >
            {renderButtonContent()}
          </button>
        )}
      </DropdownMenu.RadioItem>
    </FernTooltip>
  );
}
