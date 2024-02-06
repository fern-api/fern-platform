import * as RadioGroup from "@radix-ui/react-radio-group";
import classNames from "classnames";
import { FC, ReactNode } from "react";
import "./FernRadioGroup.css";

export interface FernRadioItem {
    value: string;
    displayName: string;
    description?: string;
    children?: ReactNode | ((checked: boolean) => ReactNode);
}

interface FernRadioGroupProps extends RadioGroup.RadioGroupProps {
    items: FernRadioItem[];
}

export const FernRadioGroup: FC<FernRadioGroupProps> = ({ items, className, ...props }) => (
    <RadioGroup.Root className={classNames("fern-radio-group", className)} {...props}>
        {items.map((item) => (
            <label key={item.value} className="fern-radio-label">
                <RadioGroup.Item value={item.value} className="fern-radio-item">
                    <RadioGroup.Indicator className="fern-radio-indicator" />
                </RadioGroup.Item>
                <div className="ml-2 flex-1">
                    <div className="text-sm">{item.displayName}</div>
                    {item.description && <p className="t-muted mb-0 text-xs">{item.description}</p>}
                    {typeof item.children === "function" ? item.children(props.value === item.value) : item.children}
                </div>
            </label>
        ))}
    </RadioGroup.Root>
);
