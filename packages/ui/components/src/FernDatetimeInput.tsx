import { format } from "date-fns";
import { ComponentProps, forwardRef } from "react";
import { FernInput } from "./FernInput";

export interface FernDatetimeInputProps extends ComponentProps<"input"> {
    inputClassName?: string;
    onValueChange?: (value: string) => void;
    resettable?: boolean;
    value?: string;
    defaultValue?: string;
}

export const FernDatetimeInput = forwardRef<HTMLInputElement, FernDatetimeInputProps>(
    ({ id, className, placeholder, value, defaultValue, onValueChange, disabled }, ref) => {
        return (
            <FernInput
                id={id}
                type="datetime-local"
                className={className}
                placeholder={placeholder}
                value={typeof value === "string" ? format(value, "yyyy-MM-dd'T'HH:mm") : undefined}
                defaultValue={typeof defaultValue === "string" ? format(defaultValue, "yyyy-MM-dd'T'HH:mm") : undefined}
                resettable={typeof defaultValue === "string"}
                onValueChange={(value) => {
                    onValueChange?.(new Date(value).toISOString());
                }}
                disabled={disabled}
                ref={ref}
            />
        );
    },
);

FernDatetimeInput.displayName = "FernDatetimeInput";
