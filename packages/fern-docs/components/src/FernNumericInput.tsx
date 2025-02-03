import { useEventCallback } from "@fern-ui/react-commons";
import cn from "clsx";
import { Minus, Plus } from "lucide-react";
import {
  ComponentProps,
  MouseEventHandler,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { FernButton } from "./FernButton";

export interface FernNumericInputProps extends ComponentProps<"input"> {
  inputClassName?: string;
  onValueChange?: (value: number) => void;
  value?: number;
  disallowFloat?: boolean;
  rightElement?: React.ReactNode;
}

export const FernNumericInput = forwardRef<
  HTMLInputElement,
  FernNumericInputProps
>(function FernInput(
  {
    className,
    inputClassName,
    value,
    onChange,
    onValueChange,
    rightElement,
    disallowFloat,
    ...props
  },
  ref
) {
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  useImperativeHandle(ref, () => inputRef.current!);

  const [internalValue, setInternalValue] = useState<number>();
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleClearInterval = useEventCallback(() => {
    if (internalValue != null) {
      onValueChange?.(internalValue);
      setInternalValue(undefined);
    }
    if (timeout.current != null) {
      clearTimeout(timeout.current);
    }
    if (stepInterval.current != null) {
      clearInterval(stepInterval.current);
    }
  });

  const decrementInternal = useCallback(() => {
    setInternalValue?.((prevValue) => (prevValue != null ? prevValue - 1 : -1));
  }, []);

  const incrementInternal = useCallback(() => {
    setInternalValue?.((prevValue) => (prevValue != null ? prevValue + 1 : 1));
  }, []);

  const decrement = useCallback(() => {
    onValueChange?.(value != null ? value - 1 : -1);
  }, [onValueChange, value]);

  const increment = useCallback(() => {
    onValueChange?.(value != null ? value + 1 : 1);
  }, [onValueChange, value]);

  const handleDecrementMouseDown: MouseEventHandler<HTMLButtonElement> =
    useEventCallback((e) => {
      handleClearInterval();
      timeout.current = setTimeout(() => {
        e.preventDefault();
        setInternalValue(value ?? 0);
        stepInterval.current = setInterval(() => {
          decrementInternal();
        }, 100);
      }, 1000);
    });

  const handleIncrementMouseDown: MouseEventHandler<HTMLButtonElement> =
    useEventCallback((e) => {
      handleClearInterval();
      timeout.current = setTimeout(() => {
        e.preventDefault();
        setInternalValue(value ?? 0);
        stepInterval.current = setInterval(() => {
          incrementInternal();
        }, 100);
      }, 1000);
    });

  useEffect(() => {
    return () => {
      handleClearInterval();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cn("fern-numeric-input-group", className)}>
      {onValueChange && (
        <FernButton
          className="fern-numeric-input-step"
          icon={<Minus />}
          variant="minimal"
          onClick={decrement}
          onMouseDown={handleDecrementMouseDown}
          onMouseUp={() => {
            handleClearInterval();
            inputRef.current?.focus();
          }}
          onMouseLeave={handleClearInterval}
          tabIndex={-1}
          disabled={
            props.disabled ||
            (props.min != null && value != null && value <= toNumber(props.min))
          }
        />
      )}
      <input
        ref={inputRef}
        type="number"
        className={cn("fern-input", inputClassName)}
        value={internalValue ?? value}
        onChange={(e) => {
          onChange?.(e);
          onValueChange?.(
            disallowFloat
              ? parseInt(e.target.value, 10)
              : parseFloat(e.target.value)
          );
        }}
        {...props}
      />
      {rightElement}
      {onValueChange && (
        <FernButton
          className="fern-numeric-input-step"
          icon={<Plus />}
          variant="minimal"
          onClick={increment}
          onMouseDown={handleIncrementMouseDown}
          onMouseUp={() => {
            handleClearInterval();
            inputRef.current?.focus();
          }}
          onMouseLeave={handleClearInterval}
          tabIndex={-1}
          disabled={
            props.disabled ||
            (props.max != null && value != null && value >= toNumber(props.max))
          }
        />
      )}
    </div>
  );
});

function toNumber(value: string | number): number {
  return typeof value === "string" ? parseFloat(value) : value;
}
