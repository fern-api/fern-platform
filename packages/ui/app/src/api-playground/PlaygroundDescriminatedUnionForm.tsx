import { Button, MenuItem, SegmentedControl, Tooltip } from "@blueprintjs/core";
import { CaretDown } from "@blueprintjs/icons";
import { Select } from "@blueprintjs/select";
import { ResolvedDiscriminatedUnionShape, ResolvedDiscriminatedUnionShapeVariant, titleCase } from "@fern-ui/app-utils";
import { FC, useCallback } from "react";
import { InfoIcon } from "../commons/icons/InfoIcon";
import { PlaygroundObjectPropertiesForm } from "./PlaygroundObjectPropertyForm";
import { castToRecord, getDefaultValueForObjectProperties } from "./utils";

interface PlaygroundDiscriminatedUnionFormProps {
    discriminatedUnion: ResolvedDiscriminatedUnionShape;
    onChange: (value: unknown) => void;
    value: unknown;
}

export const PlaygroundDiscriminatedUnionForm: FC<PlaygroundDiscriminatedUnionFormProps> = ({
    discriminatedUnion,
    onChange,
    value,
}) => {
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
                    ...getDefaultValueForObjectProperties(selectedVariant.additionalProperties),
                };
            });
        },
        [discriminatedUnion.discriminant, discriminatedUnion.variants, onChange]
    );

    const activeVariant = discriminatedUnion.variants.find((variant) => variant.discriminantValue === selectedVariant);

    return (
        <div className="w-full">
            {discriminatedUnion.variants.length < 4 ? (
                <SegmentedControl
                    options={discriminatedUnion.variants.map((variant) => ({
                        label: titleCase(variant.discriminantValue),
                        value: variant.discriminantValue,
                    }))}
                    value={selectedVariant}
                    onValueChange={setSelectedVariant}
                    small={true}
                    fill={true}
                />
            ) : (
                <Select<ResolvedDiscriminatedUnionShapeVariant>
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
                    activeItem={activeVariant}
                    popoverProps={{ minimal: true, matchTargetWidth: true }}
                    fill={true}
                >
                    <Button
                        text={
                            activeVariant != null ? (
                                <span className="font-mono">{activeVariant.discriminantValue}</span>
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
            {activeVariant != null && (
                <PlaygroundObjectPropertiesForm
                    properties={activeVariant.additionalProperties}
                    value={value}
                    onChange={onChange}
                />
            )}
        </div>
    );
};
