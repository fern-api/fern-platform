import cn from "clsx";
import { ComponentProps, forwardRef } from "react";

export interface FernInputProps extends ComponentProps<"input"> {
    inputClassName?: string;
    leftIcon?: React.ReactNode;
    rightElement?: React.ReactNode;
    onValueChange?: (value: string) => void;
    value?: string;
}

export const FernInput = forwardRef<HTMLInputElement, FernInputProps>(function FernInput(
    { className, inputClassName, value, onChange, onValueChange, leftIcon, rightElement, ...props },
    ref,
) {
    return (
        <div className={cn("fern-input-group", className)}>
            {leftIcon && <span className="fern-input-icon">{leftIcon}</span>}
            <input
                ref={ref}
                className={cn("fern-input", inputClassName)}
                value={value}
                onChange={(e) => {
                    if (props.maxLength != null && e.target.value.length > props.maxLength) {
                        return;
                    }

                    onChange?.(e);
                    onValueChange?.(e.target.value);
                }}
                {...props}
            />
            {rightElement && <span className="fern-input-right-element">{rightElement}</span>}
        </div>
    );
});
