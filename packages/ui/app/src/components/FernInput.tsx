import classNames from "classnames";
import { DetailedHTMLProps, forwardRef, InputHTMLAttributes } from "react";
import "./FernInput.css";

export interface FernInputProps extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
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
        <div className={classNames("fern-input-group", className)}>
            {leftIcon && <span className="fern-input-icon">{leftIcon}</span>}
            <input
                ref={ref}
                className={classNames("fern-input", inputClassName)}
                value={value}
                onChange={(e) => {
                    onChange?.(e);
                    onValueChange?.(e.target.value);
                }}
                {...props}
            />
            {rightElement && <span className="fern-input-right-element">{rightElement}</span>}
        </div>
    );
});
