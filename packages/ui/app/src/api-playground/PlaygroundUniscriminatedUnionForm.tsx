import { ResolvedUndiscriminatedUnionShape } from "@fern-ui/app-utils";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { FC, useCallback, useMemo, useState } from "react";
import { FernButton } from "../components/FernButton";
import { FernDropdown } from "../components/FernDropdown";
import { FernSegmentedControl } from "../components/FernSegmentedControl";
import { PlaygroundTypeReferenceForm } from "./PlaygroundTypeReferenceForm";
import { getDefaultValueForType, matchesTypeReference } from "./utils";

interface PlaygroundUniscriminatedUnionFormProps {
    undiscriminatedUnion: ResolvedUndiscriminatedUnionShape;
    onChange: (value: unknown) => void;
    value: unknown;
}

export const PlaygroundUniscriminatedUnionForm: FC<PlaygroundUniscriminatedUnionFormProps> = ({
    undiscriminatedUnion,
    onChange,
    value,
}) => {
    const [internalSelectedVariant, setInternalSelectedVariant] = useState<number>(() => {
        return Math.max(
            undiscriminatedUnion.variants.findIndex((variant) => matchesTypeReference(variant.shape, value)),
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
                onChange(getDefaultValueForType(variant.shape));
            }
        },
        [internalSelectedVariant, onChange, undiscriminatedUnion.variants],
    );

    const options = useMemo(
        () =>
            undiscriminatedUnion.variants.map((variant, idx) => ({
                label: variant.displayName,
                value: idx.toString(),
            })),
        [undiscriminatedUnion.variants],
    );

    return (
        <div className="w-full">
            {undiscriminatedUnion.variants.length < 4 ? (
                <FernSegmentedControl
                    options={options}
                    value={internalSelectedVariant.toString()}
                    onValueChange={setSelectedVariant}
                    className="mb-4 w-full"
                />
            ) : (
                <FernDropdown options={options}>
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
                <div className="mt-2">
                    <PlaygroundTypeReferenceForm shape={selectedVariant.shape} onChange={onChange} value={value} />
                </div>
            )}
        </div>
    );
};
