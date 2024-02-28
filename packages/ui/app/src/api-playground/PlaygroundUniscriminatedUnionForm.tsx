import { CaretDownIcon } from "@radix-ui/react-icons";
import dynamic from "next/dynamic";
import { FC, useCallback, useMemo, useState } from "react";
import { FernButton } from "../components/FernButton";
import { FernDropdown } from "../components/FernDropdown";
import { FernSegmentedControl } from "../components/FernSegmentedControl";
import { ResolvedTypeDefinition, ResolvedUndiscriminatedUnionShape } from "../util/resolver";
import { PlaygroundTypeReferenceForm } from "./PlaygroundTypeReferenceForm";
import { getDefaultValueForType, matchesTypeReference } from "./utils";

const Markdown = dynamic(() => import("../api-page/markdown/Markdown").then(({ Markdown }) => Markdown), {
    ssr: true,
});

interface PlaygroundUniscriminatedUnionFormProps {
    undiscriminatedUnion: ResolvedUndiscriminatedUnionShape;
    onChange: (value: unknown) => void;
    value: unknown;
    id: string;
    types: Record<string, ResolvedTypeDefinition>;
}

export const PlaygroundUniscriminatedUnionForm: FC<PlaygroundUniscriminatedUnionFormProps> = ({
    undiscriminatedUnion,
    onChange,
    value,
    id,
    types,
}) => {
    const [internalSelectedVariant, setInternalSelectedVariant] = useState<number>(() => {
        return Math.max(
            undiscriminatedUnion.variants.findIndex((variant) => matchesTypeReference(variant.shape, value, types)),
            0,
        );
    });

    const selectedVariant = undiscriminatedUnion.variants[internalSelectedVariant];

    const setSelectedVariant = useCallback(
        (variantIdxAsString: string) => {
            const variantIdx = parseInt(variantIdxAsString, 10);
            const variant = undiscriminatedUnion.variants[variantIdx];
            if (variantIdx !== internalSelectedVariant && variant != null) {
                setInternalSelectedVariant(variantIdx);
                onChange(getDefaultValueForType(variant.shape, types));
            }
        },
        [internalSelectedVariant, onChange, types, undiscriminatedUnion.variants],
    );

    const options = useMemo(
        () =>
            undiscriminatedUnion.variants.map(
                (variant, idx): FernDropdown.Option => ({
                    type: "value",
                    label: variant.displayName ?? variant.shape.type,
                    value: idx.toString(),
                    // todo: handle availability
                    tooltip:
                        variant.description != null ? (
                            <Markdown className="text-xs" mdx={variant.description} />
                        ) : undefined,
                }),
            ),
        [undiscriminatedUnion.variants],
    );

    return (
        <div className="w-full">
            {undiscriminatedUnion.variants.length < 5 ? (
                <FernSegmentedControl
                    options={options}
                    value={internalSelectedVariant.toString()}
                    onValueChange={setSelectedVariant}
                    className="mb-4 w-full"
                />
            ) : (
                <FernDropdown
                    options={options}
                    onValueChange={setSelectedVariant}
                    value={internalSelectedVariant.toString()}
                >
                    <FernButton
                        text={
                            selectedVariant != null ? (
                                <span className="font-mono">{selectedVariant.displayName}</span>
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
            {selectedVariant != null && (
                <div className="border-border-default-soft border-l pl-4">
                    <PlaygroundTypeReferenceForm
                        id={`${id}[${internalSelectedVariant}]`}
                        shape={selectedVariant.shape}
                        onChange={onChange}
                        value={value}
                        types={types}
                    />
                </div>
            )}
        </div>
    );
};
