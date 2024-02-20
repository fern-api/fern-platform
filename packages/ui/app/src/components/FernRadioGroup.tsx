import * as RadioGroup from "@radix-ui/react-radio-group";
import classNames from "classnames";
import { FC } from "react";
import { FernDropdown } from "./FernDropdown";
import "./FernRadioGroup.css";
import { FernTooltip, FernTooltipProvider } from "./FernTooltip";

interface FernRadioGroupProps extends RadioGroup.RadioGroupProps {
    options: FernDropdown.Option[];
}

export const FernRadioGroup: FC<FernRadioGroupProps> = ({ options, className, ...props }) => (
    <RadioGroup.Root className={classNames("fern-radio-group", className)} {...props}>
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
                                    <div className={classNames("text-sm", item.labelClassName)}>{item.label}</div>
                                    {item.helperText && <p className="t-muted mb-0 text-xs">{item.helperText}</p>}
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
