import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CheckIcon } from "@radix-ui/react-icons";
import { PropsWithChildren, ReactElement, forwardRef, useCallback, useState } from "react";
import { FernScrollArea } from "./FernScrollArea";

export declare namespace FernCheckboxDropdown {
    export interface ValueOption {
        type: "value";
        value: string;
        checked?: boolean;
    }
    export interface SeparatorOption {
        type: "separator";
    }

    export type Option = ValueOption | SeparatorOption;

    export interface Props {
        options: Option[];
        onSelectOption?: (value: string) => void;
        value?: string;
        onOpen?: () => void;
        side?: "top" | "right" | "bottom" | "left";
        align?: "start" | "center" | "end";
    }
}

export const FernCheckboxDropdown = forwardRef<HTMLButtonElement, PropsWithChildren<FernCheckboxDropdown.Props>>(
    ({ options, onSelectOption, value, children, onOpen, side, align }, ref): ReactElement => {
        const [isOpen, setOpen] = useState(false);
        const handleOpenChange = useCallback(
            (toOpen: boolean) => {
                setOpen(toOpen);
                if (toOpen && onOpen != null) {
                    onOpen();
                }
            },
            [onOpen],
        );

        const handleItemSelect = (e: Event, filterValue: string) => {
            e.preventDefault();
            onSelectOption(filterValue);
        };

        const renderDropdownContent = () => (
            <DropdownMenu.Content className="fern-dropdown" sideOffset={4} side={side} align={align}>
                <FernScrollArea rootClassName="min-h-0 shrink" className="p-1" scrollbars="vertical">
                    <DropdownMenu.Group>
                        {options.map((option, idx) =>
                            option.type === "value" ? (
                                <DropdownMenu.CheckboxItem
                                    key={option.value}
                                    checked={option.checked}
                                    textValue={value}
                                    onSelect={(e) => handleItemSelect(e, option.value)}
                                    className="flex flex-row items-center cursor-pointer"
                                >
                                    <DropdownMenu.ItemIndicator>
                                        <CheckIcon />
                                    </DropdownMenu.ItemIndicator>
                                    {option.value}
                                </DropdownMenu.CheckboxItem>
                            ) : (
                                <DropdownMenu.Separator key={idx} className="mx-2 my-1 h-px bg-border-default" />
                            ),
                        )}
                    </DropdownMenu.Group>
                </FernScrollArea>
            </DropdownMenu.Content>
        );

        return (
            <DropdownMenu.Root onOpenChange={handleOpenChange} open={isOpen} modal={false}>
                <DropdownMenu.Trigger asChild={true} ref={ref}>
                    {children}
                </DropdownMenu.Trigger>
                {renderDropdownContent()}
            </DropdownMenu.Root>
        );
    },
);

FernCheckboxDropdown.displayName = "FernCheckboxDropdown";
