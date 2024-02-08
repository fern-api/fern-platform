import { useEventCallback } from "@fern-ui/react-commons";
import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import {
    DetailedHTMLProps,
    forwardRef,
    InputHTMLAttributes,
    MouseEventHandler,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { FernButton } from "./FernButton";

export interface FernNumericInputProps
    extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    inputClassName?: string;
    onValueChange?: (value: number) => void;
    value?: number;
    disallowFloat?: boolean;
}

export const FernNumericInput = forwardRef<HTMLInputElement, FernNumericInputProps>(function FernInput(
    { className, inputClassName, value, onChange, onValueChange, disallowFloat, ...props },
    ref,
) {
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

    const handleDecrementMouseDown: MouseEventHandler<HTMLButtonElement> = useEventCallback((e) => {
        handleClearInterval();
        timeout.current = setTimeout(() => {
            e.preventDefault();
            setInternalValue(value ?? 0);
            stepInterval.current = setInterval(() => {
                decrementInternal();
            }, 100);
        }, 1000);
    });

    const handleIncrementMouseDown: MouseEventHandler<HTMLButtonElement> = useEventCallback((e) => {
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
        <div className={classNames("fern-numeric-input-group", className)}>
            {onValueChange && (
                <FernButton
                    className="fern-numeric-input-step"
                    icon={<MinusIcon />}
                    buttonStyle="minimal"
                    onClick={decrement}
                    onMouseDown={handleDecrementMouseDown}
                    onMouseUp={handleClearInterval}
                    onMouseLeave={handleClearInterval}
                />
            )}
            <input
                ref={ref}
                type="number"
                className={classNames("fern-input", inputClassName)}
                value={internalValue ?? value}
                onChange={(e) => {
                    onChange?.(e);
                    onValueChange?.(disallowFloat ? parseInt(e.target.value, 10) : parseFloat(e.target.value));
                }}
                {...props}
            />
            {onValueChange && (
                <FernButton
                    className="fern-numeric-input-step"
                    icon={<PlusIcon />}
                    buttonStyle="minimal"
                    onClick={increment}
                    onMouseDown={handleIncrementMouseDown}
                    onMouseUp={handleClearInterval}
                    onMouseLeave={handleClearInterval}
                />
            )}
        </div>
    );
});
