import { APIV1Read } from "@fern-api/fdr-sdk";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { FC, useCallback } from "react";
import { FernButton } from "../components/FernButton";
import { FernScrollArea } from "../components/FernScrollArea";
import { FernSegmentedControl } from "../components/FernSegmentedControl";

interface PlaygroundEnumFormProps {
    enumValues: APIV1Read.EnumValue[];
    onChange: (value: unknown) => void;
    value: unknown;
}

export const PlaygroundEnumForm: FC<PlaygroundEnumFormProps> = ({ enumValues, onChange, value }) => {
    const setSelectedValue = useCallback(
        (enumValue: APIV1Read.EnumValue) => {
            onChange(enumValue.value);
        },
        [onChange],
    );

    if (enumValues.length === 0) {
        return null;
    }

    if (enumValues.length < 3) {
        return (
            <div className="w-full">
                <FernSegmentedControl
                    options={enumValues.map((enumValue) => ({
                        label: enumValue.value,
                        value: enumValue.value,
                    }))}
                    value={typeof value === "string" ? value : undefined}
                    onValueChange={onChange}
                />
            </div>
        );
    }

    const activeItem = enumValues.find((enumValue) => enumValue.value === value);

    // return (
    //     <Select<APIV1Read.EnumValue>
    //         items={enumValues}
    //         itemRenderer={({ value, description }, { ref, handleClick, handleFocus, modifiers }) =>
    //             modifiers.matchesPredicate && (
    //                 <MenuItem
    //                     ref={ref}
    //                     active={modifiers.active}
    //                     disabled={modifiers.disabled}
    //                     key={value}
    //                     text={<span className="font-mono text-sm">{value}</span>}
    //                     onClick={handleClick}
    //                     onFocus={handleFocus}
    //                     roleStructure="listoption"
    //                     labelElement={
    //                         <Tooltip content={description} compact={true} popoverClassName="max-w-xs text-xs">
    //                             <InfoCircledIcon />
    //                         </Tooltip>
    //                     }
    //                 />
    //             )
    //         }
    //         itemPredicate={(query, { value }) => value.toLowerCase().includes(query.toLowerCase())}
    //         onItemSelect={setSelectedValue}
    //         activeItem={activeItem}
    //         popoverProps={{ minimal: true, matchTargetWidth: true }}
    //         fill={true}
    //     >
    //         <FernButton
    //             text={
    //                 activeItem != null ? (
    //                     <span className="font-mono">{activeItem.value}</span>
    //                 ) : (
    //                     <span className="t-muted">Select an enum...</span>
    //                 )
    //             }
    //             buttonStyle="outlined"
    //             rightIcon={<CaretDownIcon />}
    //             className="w-full text-left"
    //         />
    //     </Select>
    // );

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild={true}>
                <FernButton
                    text={
                        activeItem != null ? (
                            <span className="font-mono">{activeItem.value}</span>
                        ) : (
                            <span className="t-muted">Select an enum...</span>
                        )
                    }
                    buttonStyle="outlined"
                    rightIcon={<CaretDownIcon />}
                    className="w-full text-left"
                />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
                <DropdownMenu.Content className="data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade max-h-[300px] w-[size:var(--radix-dropdown-menu-trigger-width)] min-w-[220px] rounded-md bg-white will-change-[opacity,transform]">
                    <FernScrollArea>
                        {enumValues.map((enumValue) => (
                            <DropdownMenu.Item
                                key={enumValue.value}
                                onSelect={setSelectedValue.bind(null, enumValue)}
                                className="px-4 py-2"
                            >
                                {enumValue.value}
                            </DropdownMenu.Item>
                        ))}
                    </FernScrollArea>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};
