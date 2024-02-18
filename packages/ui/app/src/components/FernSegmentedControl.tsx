import * as ToggleGroup from "@radix-ui/react-toggle-group";
import classNames from "classnames";
import { FC } from "react";
import { FernButton } from "./FernButton";
import { FernDropdown } from "./FernDropdown";
import { FernTooltip, FernTooltipProvider } from "./FernTooltip";

interface FernSegmentedControlProps {
    className?: string;
    itemClassName?: string;
    options: FernDropdown.Option[];
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
    <FernTooltipProvider>
        <ToggleGroup.Root
            className={classNames("fern-segmented-control", className)}
            type="single"
            value={value}
            onValueChange={onValueChange}
        >
            {options.map((option) =>
                option.type === "value" ? (
                    <FernTooltip key={option.value} content={option.tooltip}>
                        <ToggleGroup.Item asChild={true} className={itemClassName} value={option.value}>
                            <FernButton
                                variant={option.value === value ? "filled" : "minimal"}
                                intent={option.value === value ? "primary" : "none"}
                                className="flex-1"
                                mono={true}
                            >
                                {option.label ?? option.value}
                            </FernButton>
                        </ToggleGroup.Item>
                    </FernTooltip>
                ) : null,
            )}
        </ToggleGroup.Root>
    </FernTooltipProvider>
);
