import * as RadioGroup from "@radix-ui/react-radio-group";
import clsx from "clsx";
import { forwardRef } from "react";
import { FernDropdown } from "./FernDropdown";
import { FernTooltip, FernTooltipProvider } from "./FernTooltip";

interface FernRadioGroupProps extends RadioGroup.RadioGroupProps {
    options: FernDropdown.Option[];
    compact?: boolean;
    container?: HTMLElement;
}

export const FernRadioGroup = forwardRef<HTMLDivElement, FernRadioGroupProps>(
    ({ options, className, compact, container, ...props }, ref) => (
        <RadioGroup.Root className={clsx("fern-radio-group", { compact }, className)} {...props} ref={ref}>
            <FernTooltipProvider>
                {options.map(
                    (item) =>
                        item.type === "value" && (
                            <FernTooltip content={item.tooltip} key={item.value} container={container}>
                                <label className="fern-radio-label">
                                    <RadioGroup.Item value={item.value} className="fern-radio-item">
                                        <RadioGroup.Indicator className="fern-radio-indicator" />
                                    </RadioGroup.Item>
                                    <div className="ml-2 flex-1">
                                        <div className={clsx("text-sm font-semibold", item.labelClassName)}>
                                            {item.label}
                                        </div>
                                        {item.helperText && <p className="t-muted mb-0 text-sm">{item.helperText}</p>}
                                        {typeof item.children === "function"
                                            ? item.children(props.value === item.value)
                                            : item.children}
                                    </div>
                                </label>
                            </FernTooltip>
                        ),
                )}
            </FernTooltipProvider>
        </RadioGroup.Root>
    ),
);

FernRadioGroup.displayName = "FernRadioGroup";
