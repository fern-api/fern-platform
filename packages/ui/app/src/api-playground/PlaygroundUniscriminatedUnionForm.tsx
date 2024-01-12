import { SegmentedControl } from "@blueprintjs/core";
import { APIV1Read } from "@fern-api/fdr-sdk";
import { FC, useCallback, useState } from "react";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { PlaygroundTypeReferenceForm } from "./PlaygroundTypeReferenceForm";
import { getDefaultValueForType, matchesTypeReference } from "./utils";

interface PlaygroundUniscriminatedUnionFormProps {
    undiscriminatedUnion: APIV1Read.TypeShape.UndiscriminatedUnion;
    onChange: (value: unknown) => void;
    value: unknown;
}

export const PlaygroundUniscriminatedUnionForm: FC<PlaygroundUniscriminatedUnionFormProps> = ({
    undiscriminatedUnion,
    onChange,
    value,
}) => {
    const { resolveTypeById } = useApiDefinitionContext();

    const [internalSelectedVariant, setInternalSelectedVariant] = useState<number>(() => {
        return Math.max(
            undiscriminatedUnion.variants.findIndex((variant) =>
                matchesTypeReference(variant.type, resolveTypeById, value)
            ),
            0
        );
    });

    const selectedVariant = undiscriminatedUnion.variants[internalSelectedVariant];

    const setSelectedVariant = useCallback(
        (variantIdxAsString: string) => {
            const variantIdx = parseInt(variantIdxAsString, 10);
            const variant = undiscriminatedUnion.variants[variantIdx];
            if (variantIdx !== internalSelectedVariant && variant != null) {
                setInternalSelectedVariant(variantIdx);
                onChange(getDefaultValueForType(variant.type, resolveTypeById));
            }
        },
        [internalSelectedVariant, onChange, resolveTypeById, undiscriminatedUnion.variants]
    );

    // const variantTypeReference = undiscriminatedUnion.variants[selectedVariant]?.type;
    return (
        <div className="w-full">
            <SegmentedControl
                options={undiscriminatedUnion.variants.map((variant, idx) => ({
                    label: variant.displayName,
                    value: idx.toString(),
                }))}
                value={internalSelectedVariant.toString()}
                onValueChange={setSelectedVariant}
                small={true}
                fill={true}
            />
            {selectedVariant != null && (
                <PlaygroundTypeReferenceForm typeReference={selectedVariant.type} onChange={onChange} value={value} />
            )}
        </div>
    );
};
