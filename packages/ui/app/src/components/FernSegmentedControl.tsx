import * as ToggleGroup from "@radix-ui/react-toggle-group";
import classNames from "classnames";
import { FC } from "react";
import { FernButton } from "./FernButton";

interface FernSegmentedControlOption {
    label?: string;
    value: string;
}

interface FernSegmentedControlProps {
    className?: string;
    itemClassName?: string;
    options: FernSegmentedControlOption[];
    value?: string;
    onValueChange: (value: string) => void;
}

export const FernSegmentedControl: FC<FernSegmentedControlProps> = ({
    className,
    itemClassName,
    options,
    value,
    onValueChange,
}) => (
    <ToggleGroup.Root
        className={classNames("fern-segmented-control", className)}
        type="single"
        value={value}
        onValueChange={onValueChange}
    >
        {options.map((option) => (
            <ToggleGroup.Item
                asChild={true}
                key={option.value}
                className={itemClassName}
                value={option.value}
                aria-label={option.label}
            >
                <FernButton
                    buttonStyle={option.value === value ? "outlined" : "minimal"}
                    intent={option.value === value ? "primary" : "none"}
                    size="small"
                >
                    {option.label ?? option.value}
                </FernButton>
            </ToggleGroup.Item>
        ))}
    </ToggleGroup.Root>
);
