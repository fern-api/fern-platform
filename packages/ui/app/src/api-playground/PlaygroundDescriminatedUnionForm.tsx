import { ResolvedDiscriminatedUnionShape, titleCase } from "@fern-ui/app-utils";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { FC, useCallback, useMemo } from "react";
import { FernButton } from "../components/FernButton";
import { FernDropdown } from "../components/FernDropdown";
import { FernSegmentedControl } from "../components/FernSegmentedControl";
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
                    (variant) => variant.discriminantValue === variantKey,
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
        [discriminatedUnion.discriminant, discriminatedUnion.variants, onChange],
    );

    const activeVariant = discriminatedUnion.variants.find((variant) => variant.discriminantValue === selectedVariant);

    const options = useMemo(
        () =>
            discriminatedUnion.variants.map((variant) => ({
                label: titleCase(variant.discriminantValue),
                value: variant.discriminantValue,
            })),
        [discriminatedUnion.variants],
    );

    return (
        <div className="w-full">
            {discriminatedUnion.variants.length < 5 ? (
                <FernSegmentedControl
                    options={options}
                    value={selectedVariant}
                    onValueChange={setSelectedVariant}
                    className="mb-4 w-full"
                />
            ) : (
                <FernDropdown options={options} onValueChange={setSelectedVariant} value={selectedVariant}>
                    <FernButton
                        text={
                            activeVariant != null ? (
                                <span className="font-mono">{activeVariant.discriminantValue}</span>
                            ) : (
                                <span className="t-muted">Select a variant...</span>
                            )
                        }
                        rightIcon={<CaretDownIcon />}
                        className="w-full text-left"
                        variant="outlined"
                        mono={true}
                    />
                </FernDropdown>
            )}
            {activeVariant != null && (
                <PlaygroundObjectPropertiesForm
                    properties={activeVariant.additionalProperties}
                    value={value}
                    onChange={onChange}
                    hideObjects={false}
                    sortProperties={false}
                />
            )}
        </div>
    );
};
