import { Button, MenuItem, SegmentedControl, Tooltip } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";
import { ResolvedUndiscriminatedUnionShape, ResolvedUndiscriminatedUnionShapeVariant } from "@fern-ui/app-utils";
import { CaretDownIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { isEqual } from "lodash-es";
import { FC, useCallback, useState } from "react";
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

    return (
        <div className="w-full">
            {undiscriminatedUnion.variants.length < 4 ? (
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
            ) : (
                <Select<ResolvedUndiscriminatedUnionShapeVariant>
                    items={undiscriminatedUnion.variants}
                    itemRenderer={(variant, { ref, handleClick, handleFocus, modifiers, index }) =>
                        modifiers.matchesPredicate && (
                            <MenuItem
                                ref={ref}
                                active={modifiers.active}
                                disabled={modifiers.disabled}
                                key={index}
                                text={<span className="font-mono text-sm">{variant.displayName}</span>}
                                onClick={handleClick}
                                onFocus={handleFocus}
                                roleStructure="listoption"
                                labelElement={
                                    <Tooltip
                                        content={variant.description}
                                        compact={true}
                                        popoverClassName="max-w-xs text-xs"
                                    >
                                        <InfoCircledIcon />
                                    </Tooltip>
                                }
                            />
                        )
                    }
                    itemPredicate={(query, variant) =>
                        variant.displayName?.toLowerCase().includes(query.toLowerCase()) ?? false
                    }
                    onItemSelect={(variant) =>
                        setSelectedVariant(
                            undiscriminatedUnion.variants.findIndex((v) => isEqual(v, variant)).toString(10),
                        )
                    }
                    activeItem={selectedVariant}
                    popoverProps={{ minimal: true, matchTargetWidth: true }}
                    fill={true}
                >
                    <Button
                        text={
                            selectedVariant != null ? (
                                <span className="font-mono">{selectedVariant.displayName}</span>
                            ) : (
                                <span className="t-muted">Select a variant...</span>
                            )
                        }
                        alignText="left"
                        rightIcon={<CaretDownIcon />}
                        fill={true}
                    />
                </Select>
            )}
            {selectedVariant != null && (
                <div className="mt-2">
                    <PlaygroundTypeReferenceForm shape={selectedVariant.shape} onChange={onChange} value={value} />
                </div>
            )}
        </div>
    );
};
