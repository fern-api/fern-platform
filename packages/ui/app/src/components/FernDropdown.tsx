import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { PropsWithChildren, ReactElement, useRef, useState } from "react";
import { Check } from "react-feather";
import { FernButton } from "./FernButton";
import { FernScrollArea } from "./FernScrollArea";

interface FernDropdownOption {
    label?: string;
    value: string;
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
        <DropdownMenu.Root onOpenChange={setOpen}>
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
                                    <FernButton
                                        ref={option.value === value ? activeRef : undefined}
                                        buttonStyle={option.value === value ? "outlined" : "minimal"}
                                        className="w-full text-left"
                                        rightIcon={
                                            <DropdownMenu.ItemIndicator asChild={true}>
                                                <Check className="size-4" />
                                            </DropdownMenu.ItemIndicator>
                                        }
                                        intent={option.value === value ? "primary" : "none"}
                                    >
                                        {option.label ?? option.value}
                                    </FernButton>
                                </DropdownMenu.RadioItem>
                            ))}
                        </DropdownMenu.RadioGroup>
                    </FernScrollArea>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}
