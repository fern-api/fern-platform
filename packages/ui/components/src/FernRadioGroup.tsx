import * as RadioGroup from "@radix-ui/react-radio-group";
import cn from "clsx";
import { FC } from "react";
import { FernDropdown } from "./FernDropdown";
import "./FernRadioGroup.css";
import { FernTooltip, FernTooltipProvider } from "./FernTooltip";

interface FernRadioGroupProps extends RadioGroup.RadioGroupProps {
    options: FernDropdown.Option[];
    compact?: boolean;
}

export const FernRadioGroup: FC<FernRadioGroupProps> = ({ options, className, compact, ...props }) => (
    <RadioGroup.Root className={cn("fern-radio-group", { compact }, className)} {...props}>
        <FernTooltipProvider>
            {options.map(
                (item) =>
                    item.type === "value" && (
                        <FernTooltip content={item.tooltip} key={item.value}>
                            <label className="fern-radio-label">
                                <RadioGroup.Item value={item.value} className="fern-radio-item">
                                    <RadioGroup.Indicator className="fern-radio-indicator" />
                                </RadioGroup.Item>
                                <div className="ml-2 flex-1">
                                    <div className={cn("text-sm font-semibold", item.labelClassName)}>{item.label}</div>
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
);
