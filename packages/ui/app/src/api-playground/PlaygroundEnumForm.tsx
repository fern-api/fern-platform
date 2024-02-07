import { Button, MenuItem, SegmentedControl, Tooltip } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";
import { APIV1Read } from "@fern-api/fdr-sdk";
import { CaretDownIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { FC, useCallback } from "react";

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
                <SegmentedControl
                    options={enumValues.map((enumValue) => ({
                        label: enumValue.value,
                        value: enumValue.value,
                    }))}
                    value={typeof value === "string" ? value : undefined}
                    onValueChange={onChange}
                    small={true}
                    fill={true}
                />
            </div>
        );
    }

    const activeItem = enumValues.find((enumValue) => enumValue.value === value);

    return (
        <Select<APIV1Read.EnumValue>
            items={enumValues}
            itemRenderer={({ value, description }, { ref, handleClick, handleFocus, modifiers }) =>
                modifiers.matchesPredicate && (
                    <MenuItem
                        ref={ref}
                        active={modifiers.active}
                        disabled={modifiers.disabled}
                        key={value}
                        text={<span className="font-mono text-sm">{value}</span>}
                        onClick={handleClick}
                        onFocus={handleFocus}
                        roleStructure="listoption"
                        labelElement={
                            <Tooltip content={description} compact={true} popoverClassName="max-w-xs text-xs">
                                <InfoCircledIcon />
                            </Tooltip>
                        }
                    />
                )
            }
            itemPredicate={(query, { value }) => value.toLowerCase().includes(query.toLowerCase())}
            onItemSelect={setSelectedValue}
            activeItem={activeItem}
            popoverProps={{ minimal: true, matchTargetWidth: true }}
            fill={true}
        >
            <Button
                text={
                    activeItem != null ? (
                        <span className="font-mono">{activeItem.value}</span>
                    ) : (
                        <span className="t-muted">Select an enum...</span>
                    )
                }
                alignText="left"
                rightIcon={<CaretDownIcon />}
                fill={true}
            />
        </Select>
    );
};
