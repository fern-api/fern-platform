import { ComponentPropsWithoutRef, forwardRef, useRef } from "react";

import { composeEventHandlers } from "@radix-ui/primitive";
import { composeRefs } from "@radix-ui/react-compose-refs";
import cn from "clsx";
import { isEqual } from "es-toolkit/predicate";
import { Undo2 } from "lucide-react";

import { Button } from "./FernButtonV2";
import { FernTooltip, FernTooltipProvider } from "./FernTooltip";

export interface FernInputProps
  extends Omit<ComponentPropsWithoutRef<"input">, "value" | "defaultValue"> {
  value?: string;
  defaultValue?: string;

  /**
   * Additional classes to apply to the input element
   */
  inputClassName?: string;
  /**
   * Icon to render on the left side of the input
   */
  leftIcon?: React.ReactNode;
  /**
   * Element to render on the right side of the input
   */
  rightElement?: React.ReactNode;
  /**
   * Callback to call when the value changes
   */
  onValueChange?: (value: string) => void;
  /**
   * Whether the input should render a reset button if the default value is different from the current value
   * @default false
   */
  resettable?: boolean;
  /**
   * Callback to call when the reset button is clicked
   */
  onClickReset?: () => void;
}

export const FernInput = forwardRef<HTMLInputElement, FernInputProps>(
  function FernInput(
    {
      className,
      inputClassName,
      onValueChange,
      leftIcon,
      rightElement,
      resettable,
      onClickReset,
      ...props
    },
    forwardedRef
  ) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
      <div className={cn("fern-input-group", className)}>
        {leftIcon && <span className="fern-input-icon">{leftIcon}</span>}
        <input
          ref={composeRefs(forwardedRef, inputRef)}
          {...props}
          className={cn("fern-input", inputClassName)}
          onChange={composeEventHandlers(
            props.onChange,
            (e) => {
              if (
                props.maxLength != null &&
                e.currentTarget.value.length > props.maxLength
              ) {
                return;
              }

              onValueChange?.(e.currentTarget.value);
            },
            { checkForDefaultPrevented: true }
          )}
          placeholder={props.placeholder ?? props.defaultValue}
        />
        <FernInputRightElement
          value={props.value}
          onReset={
            onClickReset ??
            (() => {
              if (props.defaultValue != null) {
                onValueChange?.(props.defaultValue);
                inputRef.current?.focus();
              }
            })
          }
          resettable={resettable}
        >
          {rightElement}
        </FernInputRightElement>
      </div>
    );
  }
);

const FernInputResetButton = forwardRef<
  HTMLButtonElement,
  Omit<ComponentPropsWithoutRef<typeof Button>, "variant" | "size" | "children">
>(function FernInputResetButton({ onClick, ...props }, forwardedRef) {
  return (
    <Button
      ref={forwardedRef}
      variant="ghost"
      size="iconSm"
      onClick={onClick}
      {...props}
    >
      <Undo2 />
    </Button>
  );
});

function FernInputRightElement({
  children,
  value,
  defaultValue,
  onReset,
  resettable,
}: {
  children?: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onReset: () => void;
  resettable?: boolean;
}) {
  if (resettable && defaultValue != null && !isEqual(value, defaultValue)) {
    return (
      <FernTooltipProvider>
        <FernTooltip
          content={
            <div className="space-y-2">
              <p>Reset to the default value:</p>
              <p className="break-all">
                <code>{defaultValue}</code>
              </p>
            </div>
          }
        >
          <FernInputResetButton onClick={onReset} className="mr-0.5 shrink-0" />
        </FernTooltip>
      </FernTooltipProvider>
    );
  }

  if (!children) {
    return null;
  }

  return <span className="fern-input-right-element">{children}</span>;
}
