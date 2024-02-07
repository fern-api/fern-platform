import classNames from "classnames";
import { DetailedHTMLProps, forwardRef, InputHTMLAttributes } from "react";
import "./FernInput.css";

interface FernInputProps extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    onValueChange?: (value: string) => void;
    value?: string;
}

export const FernInput = forwardRef<HTMLInputElement, FernInputProps>(function FernInput(
    { className, value, onChange, onValueChange, ...props },
    ref,
) {
    return (
        <input
            ref={ref}
            className={classNames("fern-input", className)}
            value={value}
            onChange={(e) => {
                onChange?.(e);
                onValueChange?.(e.target.value);
            }}
            {...props}
        />
    );
});
