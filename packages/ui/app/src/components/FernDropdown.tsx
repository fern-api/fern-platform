import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CheckIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import { PropsWithChildren, ReactElement, ReactNode, useRef, useState } from "react";
import { FernScrollArea } from "./FernScrollArea";
import { FernTooltip, FernTooltipProvider } from "./FernTooltip";

export declare namespace FernDropdown {
    export interface ValueOption {
        type: "value";
        label?: ReactNode;
        value: string;
        rightElement?: ReactNode;
        tooltip?: ReactNode;
        className?: string;
    }
    export interface SeparatorOption {
        type: "separator";
    }

    export type Option = ValueOption | SeparatorOption;

    export interface Props {
        options: Option[];
        onValueChange?: (value: string) => void;
        value?: string;
    }
}

export function FernDropdown({
    options,
    onValueChange,
    value,
    children,
}: PropsWithChildren<FernDropdown.Props>): ReactElement {
    const activeRef = useRef<HTMLButtonElement>(null);
    const [isOpen, setOpen] = useState(false);
    return (
        <DropdownMenu.Root onOpenChange={setOpen} open={isOpen} modal={true}>
            <DropdownMenu.Trigger asChild={true}>{children}</DropdownMenu.Trigger>
            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    className="fern-dropdown"
                    onAnimationStart={() => {
                        if (isOpen) {
                            activeRef.current?.scrollIntoView({ block: "center" });
                        }
                    }}
                    sideOffset={4}
                >
                    <FernTooltipProvider>
                        <FernScrollArea className="min-h-0 shrink" viewportClassName="p-1">
                            <DropdownMenu.RadioGroup value={value} onValueChange={onValueChange}>
                                {options.map((option, idx) =>
                                    option.type === "value" ? (
                                        <FernTooltip
                                            content={option.tooltip}
                                            key={option.value}
                                            side="right"
                                            sideOffset={8}
                                        >
                                            <div>
                                                <DropdownMenu.RadioItem asChild={true} value={option.value}>
                                                    <button
                                                        ref={option.value === value ? activeRef : undefined}
                                                        className={classNames("fern-dropdown-item", option.className)}
                                                    >
                                                        {value != null && (
                                                            <span className="fern-dropdown-item-indicator">
                                                                <DropdownMenu.ItemIndicator asChild={true}>
                                                                    <CheckIcon />
                                                                </DropdownMenu.ItemIndicator>
                                                            </span>
                                                        )}
                                                        <span>{option.label ?? option.value}</span>
                                                        <span className="ml-auto space-x-1">
                                                            {option.rightElement && <span>{option.rightElement}</span>}
                                                            {option.tooltip != null && option.tooltip !== "" && (
                                                                <InfoCircledIcon />
                                                            )}
                                                        </span>
                                                    </button>
                                                </DropdownMenu.RadioItem>
                                            </div>
                                        </FernTooltip>
                                    ) : (
                                        <DropdownMenu.Separator
                                            key={idx}
                                            className="bg-border-default mx-2 my-1 h-px"
                                        />
                                    ),
                                )}
                            </DropdownMenu.RadioGroup>
                        </FernScrollArea>
                    </FernTooltipProvider>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}
