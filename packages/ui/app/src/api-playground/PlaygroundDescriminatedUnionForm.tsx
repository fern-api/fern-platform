import { Button, MenuItem, SegmentedControl, Tooltip } from "@blueprintjs/core";
import { CaretDown } from "@blueprintjs/icons";
import { Select } from "@blueprintjs/select";
import { APIV1Read } from "@fern-api/fdr-sdk";
import { startCase } from "lodash-es";
import { FC, useCallback } from "react";
import { getAllObjectProperties } from "../api-page/utils/getAllObjectProperties";
import { InfoIcon } from "../commons/icons/InfoIcon";
import { useApiPlaygroundContext } from "./ApiPlaygroundContext";
import { PlaygroundObjectPropertyForm } from "./PlaygroundObjectPropertyForm";
import { castToRecord, getDefaultValueForObject } from "./utils";

interface PlaygroundDiscriminatedUnionFormProps {
    discriminatedUnion: APIV1Read.TypeShape.DiscriminatedUnion;
    onChange: (value: unknown) => void;
    value: unknown;
}

export const PlaygroundDiscriminatedUnionForm: FC<PlaygroundDiscriminatedUnionFormProps> = ({
    discriminatedUnion,
    onChange,
    value,
}) => {
    const { resolveTypeById } = useApiPlaygroundContext();

    const selectedVariant =
        value != null ? (castToRecord(value)[discriminatedUnion.discriminant] as string) : undefined;

    const setSelectedVariant = useCallback(
        (variantKey: string) => {
            onChange((oldValue: unknown) => {
                const currentVariantKey = castToRecord(oldValue)[discriminatedUnion.discriminant] as string | undefined;
                if (currentVariantKey === variantKey) {
                    return oldValue;
                }
                const selectedVariant = discriminatedUnion.variants.find(
                    (variant) => variant.discriminantValue === variantKey
                );
                if (selectedVariant == null) {
                    // eslint-disable-next-line no-console
                    console.error(`Could not find variant with discriminant value ${variantKey}`);
                    return oldValue;
                }
                return {
                    [discriminatedUnion.discriminant]: variantKey,
                    ...getDefaultValueForObject(selectedVariant.additionalProperties, resolveTypeById),
                };
            });
        },
        [discriminatedUnion.discriminant, discriminatedUnion.variants, onChange, resolveTypeById]
    );

    const handleChangeProperty = useCallback(
        (key: string, newValue: unknown) => {
            onChange((oldValue: unknown) => {
                const oldObject = castToRecord(oldValue);
                return {
                    ...oldObject,
                    [key]: typeof newValue === "function" ? newValue(oldObject[key]) : newValue,
                };
            });
        },
        [onChange]
    );

    const activeItem = discriminatedUnion.variants.find((variant) => variant.discriminantValue === selectedVariant);

    const variantObject = activeItem?.additionalProperties;

    return (
        <div className="w-full">
            {discriminatedUnion.variants.length < 4 ? (
                <SegmentedControl
                    options={discriminatedUnion.variants.map((variant) => ({
                        label: startCase(variant.discriminantValue),
                        value: variant.discriminantValue,
                    }))}
                    value={selectedVariant}
                    onValueChange={setSelectedVariant}
                    small={true}
                    fill={true}
                />
            ) : (
                <Select<APIV1Read.DiscriminatedUnionVariant>
                    items={discriminatedUnion.variants}
                    itemRenderer={(variant, { ref, handleClick, handleFocus, modifiers }) =>
                        modifiers.matchesPredicate && (
                            <MenuItem
                                ref={ref}
                                active={modifiers.active}
                                disabled={modifiers.disabled}
                                key={variant.discriminantValue}
                                text={<span className="font-mono text-sm">{variant.discriminantValue}</span>}
                                onClick={handleClick}
                                onFocus={handleFocus}
                                roleStructure="listoption"
                                labelElement={
                                    <Tooltip
                                        content={variant.description}
                                        compact={true}
                                        popoverClassName="max-w-xs text-xs"
                                    >
                                        <InfoIcon />
                                    </Tooltip>
                                }
                            />
                        )
                    }
                    itemPredicate={(query, variant) =>
                        variant.discriminantValue.toLowerCase().includes(query.toLowerCase())
                    }
                    onItemSelect={(variant) => setSelectedVariant(variant.discriminantValue)}
                    activeItem={activeItem}
                    popoverProps={{ minimal: true, matchTargetWidth: true }}
                    fill={true}
                >
                    <Button
                        text={
                            activeItem != null ? (
                                <span className="font-mono">{activeItem.discriminantValue}</span>
                            ) : (
                                <span className="t-muted">Select a variant...</span>
                            )
                        }
                        alignText="left"
                        rightIcon={<CaretDown />}
                        fill={true}
                    />
                </Select>
            )}
            {variantObject != null && (
                <ul className="divide-border-default-dark dark:divide-border-default-dark border-border-default-light dark:border-border-default-dark -mx-4 my-4 list-none divide-y border-y">
                    {getAllObjectProperties(variantObject, resolveTypeById).map((property) => (
                        <PlaygroundObjectPropertyForm
                            key={property.key}
                            property={property}
                            onChange={handleChangeProperty}
                            value={castToRecord(value)[property.key]}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
};
