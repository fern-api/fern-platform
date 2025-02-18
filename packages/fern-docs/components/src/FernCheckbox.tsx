import { FC, ReactNode } from "react";

import * as Checkbox from "@radix-ui/react-checkbox";
import { Check } from "iconoir-react";

import { cn } from "./cn";

interface FernCheckboxProps extends Checkbox.CheckboxProps {
  labelClassName?: string;
  label?: ReactNode;
  helperText?: ReactNode;
  compact?: boolean;
}

export const FernCheckbox: FC<FernCheckboxProps> = ({
  labelClassName,
  label,
  helperText,
  children,
  className,
  compact,
  ...props
}) => (
  <label className={cn("fern-checkbox-label", { compact })}>
    <Checkbox.Root className="fern-checkbox-item" {...props}>
      <Checkbox.Indicator className="fern-checkbox-indicator">
        <Check />
      </Checkbox.Indicator>
    </Checkbox.Root>

    <div className="ml-2 flex-1">
      <div className={cn("text-sm font-semibold", labelClassName)}>{label}</div>
      {helperText && <p className="text-muted mb-0 text-xs">{helperText}</p>}
      {children}
    </div>
  </label>
);
