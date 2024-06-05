import * as ToggleGroup from "@radix-ui/react-toggle-group";
import cn from "clsx";
import { FC } from "react";
import { FernButton } from "./FernButton.js";
import { FernDropdown } from "./FernDropdown.js";
import { FernTooltip, FernTooltipProvider } from "./FernTooltip.js";

interface FernSegmentedControlProps {
    className?: string;
    itemClassName?: string;
    options: FernDropdown.Option[];
    value?: string;
    onValueChange: (value: string) => void;
    muted?: boolean;
}

export const FernSegmentedControl: FC<FernSegmentedControlProps> = ({
    className,
    itemClassName,
    options,
    value,
    onValueChange,
    muted,
}) => (
    <FernTooltipProvider>
        <ToggleGroup.Root
            className={cn("fern-segmented-control", className)}
            type="single"
            value={value}
            onValueChange={onValueChange}
        >
            {options.map((option) =>
                option.type === "value" ? (
                    <FernTooltip key={option.value} content={option.tooltip}>
                        <div className="min-w-0 flex-1 shrink">
                            <ToggleGroup.Item asChild={true} className={itemClassName} value={option.value}>
                                <FernButton
                                    variant={"minimal"}
                                    intent={muted ? "none" : option.value === value ? "primary" : "none"}
                                    className="w-full"
                                >
                                    {option.label ?? option.value}
                                </FernButton>
                            </ToggleGroup.Item>
                        </div>
                    </FernTooltip>
                ) : null,
            )}
        </ToggleGroup.Root>
    </FernTooltipProvider>
);
