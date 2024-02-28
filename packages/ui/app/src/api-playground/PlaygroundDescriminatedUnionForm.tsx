import { CaretDownIcon } from "@radix-ui/react-icons";
import dynamic from "next/dynamic";
import { FC, useCallback, useMemo } from "react";
import { FernButton } from "../components/FernButton";
import { FernDropdown } from "../components/FernDropdown";
import { FernSegmentedControl } from "../components/FernSegmentedControl";
import { dereferenceObjectProperties, ResolvedDiscriminatedUnionShape, ResolvedTypeDefinition } from "../util/resolver";
import { titleCase } from "../util/titleCase";
import { PlaygroundObjectPropertiesForm } from "./PlaygroundObjectPropertyForm";
import { castToRecord, getDefaultValueForObjectProperties } from "./utils";

const Markdown = dynamic(() => import("../api-page/markdown/Markdown").then(({ Markdown }) => Markdown), {
    ssr: true,
});

interface PlaygroundDiscriminatedUnionFormProps {
    discriminatedUnion: ResolvedDiscriminatedUnionShape;
    types: Record<string, ResolvedTypeDefinition>;
    onChange: (value: unknown) => void;
    value: unknown;
    id: string;
}

export const PlaygroundDiscriminatedUnionForm: FC<PlaygroundDiscriminatedUnionFormProps> = ({
    discriminatedUnion,
    types,
    onChange,
    value,
    id,
}) => {
    const selectedVariantKey =
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
                    ...getDefaultValueForObjectProperties(dereferenceObjectProperties(selectedVariant, types), types),
                };
            });
        },
        [discriminatedUnion.discriminant, discriminatedUnion.variants, onChange, types],
    );

    const activeVariant = discriminatedUnion.variants.find(
        (variant) => variant.discriminantValue === selectedVariantKey,
    );

    const options = useMemo(
        () =>
            discriminatedUnion.variants.map(
                (variant): FernDropdown.Option => ({
                    type: "value",
                    label: titleCase(variant.discriminantValue),
                    value: variant.discriminantValue,
                    // todo: handle availability
                    tooltip:
                        variant.description != null ? (
                            <Markdown className="text-xs" mdx={variant.description} />
                        ) : undefined,
                }),
            ),
        [discriminatedUnion.variants],
    );

    const selectedVariant = discriminatedUnion.variants.find(
        (variant) => variant.discriminantValue === selectedVariantKey,
    );

    const properties = selectedVariant != null ? dereferenceObjectProperties(selectedVariant, types) : [];

    return (
        <div className="w-full">
            {discriminatedUnion.variants.length < 5 ? (
                <FernSegmentedControl
                    options={options}
                    value={selectedVariantKey}
                    onValueChange={setSelectedVariant}
                    className="mb-4 w-full"
                />
            ) : (
                <FernDropdown options={options} onValueChange={setSelectedVariant} value={selectedVariantKey}>
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
                <div className="border-border-default-soft border-l pl-4">
                    <PlaygroundObjectPropertiesForm
                        properties={properties}
                        value={value}
                        onChange={onChange}
                        id={id}
                        types={types}
                    />
                </div>
            )}
        </div>
    );
};
