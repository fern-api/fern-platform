import { SegmentedControl } from "@blueprintjs/core";
import { APIV1Read } from "@fern-api/fdr-sdk";
import { startCase } from "lodash-es";
import { FC, useCallback } from "react";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { getAllObjectProperties } from "../api-page/utils/getAllObjectProperties";
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
    const { resolveTypeById } = useApiDefinitionContext();

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
                    [key]: newValue,
                };
            });
        },
        [onChange]
    );

    const variantObject = discriminatedUnion.variants.find(
        (variant) => variant.discriminantValue === selectedVariant
    )?.additionalProperties;

    return (
        <div className="w-full">
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
            {variantObject != null && (
                <ul className="border-border-default-light dark:border-border-default-dark mt-2 w-full list-none space-y-4 border-l pl-4">
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
