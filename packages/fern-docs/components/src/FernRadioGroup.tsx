"use client";

import { forwardRef } from "react";

import * as RadioGroup from "@radix-ui/react-radio-group";

import { FernDropdown } from "./FernDropdown";
import { FernTooltip, FernTooltipProvider } from "./FernTooltip";
import { cn } from "./cn";

interface FernRadioGroupProps extends RadioGroup.RadioGroupProps {
  options: FernDropdown.Option[];
  compact?: boolean;
  container?: HTMLElement;
}

export const FernRadioGroup = forwardRef<HTMLDivElement, FernRadioGroupProps>(
  ({ options, className, compact, container, ...props }, ref) => (
    <RadioGroup.Root
      className={cn("fern-radio-group", { compact }, className)}
      {...props}
      ref={ref}
    >
      <FernTooltipProvider>
        {options.map(
          (item) =>
            item.type === "value" && (
              <FernTooltip
                content={item.tooltip}
                key={item.value}
                container={container}
              >
                <label className="fern-radio-label">
                  <RadioGroup.Item
                    value={item.value}
                    className="fern-radio-item"
                  >
                    <RadioGroup.Indicator className="fern-radio-indicator" />
                  </RadioGroup.Item>
                  <div className="ml-2 flex-1">
                    <div
                      className={cn(
                        "text-sm font-semibold",
                        item.labelClassName
                      )}
                    >
                      {item.label}
                    </div>
                    {item.helperText && (
                      <p className="text-(color:--grayscale-a11) mb-0 text-sm">
                        {item.helperText}
                      </p>
                    )}
                    {typeof item.children === "function"
                      ? item.children(props.value === item.value)
                      : item.children}
                  </div>
                </label>
              </FernTooltip>
            )
        )}
      </FernTooltipProvider>
    </RadioGroup.Root>
  )
);

FernRadioGroup.displayName = "FernRadioGroup";
