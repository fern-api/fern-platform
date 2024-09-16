import { FernButton, FernDropdown, FernSegmentedControl } from "@fern-ui/components";
import { titleCase } from "@fern-platform/core-utils";
import { NavArrowDown } from "iconoir-react";
import dynamic from "next/dynamic";
import { memo, useCallback, useMemo } from "react";
import {
    ResolvedDiscriminatedUnionShape,
    ResolvedTypeDefinition,
    dereferenceObjectProperties,
} from "../../resolver/types";
import { castToRecord, getDefaultValueForObjectProperties } from "../utils";
import { PlaygroundObjectPropertiesForm } from "./PlaygroundObjectPropertyForm";

const Markdown = dynamic(() => import("../../mdx/Markdown").then(({ Markdown }) => Markdown), {
    ssr: true,
});

interface PlaygroundDiscriminatedUnionFormProps {
    discriminatedUnion: ResolvedDiscriminatedUnionShape;
    types: Record<string, ResolvedTypeDefinition>;
    onChange: (value: unknown) => void;
    value: unknown;
    id: string;
    disabled?: boolean;
}

export const PlaygroundDiscriminatedUnionForm = memo<PlaygroundDiscriminatedUnionFormProps>((props) => {
    const { discriminatedUnion, types, onChange, value, id, disabled } = props;
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
                    label: variant.displayName ?? titleCase(variant.discriminantValue),
                    value: variant.discriminantValue,
                    // todo: handle availability
                    tooltip: variant.description != null ? <Markdown size="xs" mdx={variant.description} /> : undefined,
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
                    muted={disabled}
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
                        rightIcon={<NavArrowDown />}
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
                        disabled={disabled}
                    />
                </div>
            )}
        </div>
    );
});

PlaygroundDiscriminatedUnionForm.displayName = "PlaygroundDiscriminatedUnionForm";
