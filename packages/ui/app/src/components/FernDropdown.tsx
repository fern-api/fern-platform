import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CheckIcon } from "@radix-ui/react-icons";
import { PropsWithChildren, ReactElement, ReactNode, useRef, useState } from "react";
import { FernScrollArea } from "./FernScrollArea";

interface FernDropdownOption {
    label?: ReactNode;
    value: string;
    rightElement?: ReactNode;
}

interface FernDropdown {
    options: FernDropdownOption[];
    onValueChange?: (value: string) => void;
    value?: string;
}

export function FernDropdown({
    options,
    onValueChange,
    value,
    children,
}: PropsWithChildren<FernDropdown>): ReactElement {
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
                    <FernScrollArea className="min-h-0 shrink" viewportClassName="p-1">
                        <DropdownMenu.RadioGroup value={value} onValueChange={onValueChange}>
                            {options.map((option) => (
                                <DropdownMenu.RadioItem asChild={true} key={option.value} value={option.value}>
                                    <button
                                        ref={option.value === value ? activeRef : undefined}
                                        className="fern-dropdown-item"
                                    >
                                        {value != null && (
                                            <span className="fern-dropdown-item-indicator">
                                                <DropdownMenu.ItemIndicator asChild={true}>
                                                    <CheckIcon />
                                                </DropdownMenu.ItemIndicator>
                                            </span>
                                        )}
                                        <span>{option.label ?? option.value}</span>
                                        {option.rightElement && <span className="ml-auto">{option.rightElement}</span>}
                                    </button>
                                </DropdownMenu.RadioItem>
                            ))}
                        </DropdownMenu.RadioGroup>
                    </FernScrollArea>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}
