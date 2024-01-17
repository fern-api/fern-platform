import { Button, MenuItem, SegmentedControl, Tooltip } from "@blueprintjs/core";
import { CaretDown } from "@blueprintjs/icons";
import { Select } from "@blueprintjs/select";
import { APIV1Read } from "@fern-api/fdr-sdk";
import { isEqual } from "instantsearch.js/es/lib/utils";
import { FC, useCallback, useState } from "react";
import { InfoIcon } from "../commons/icons/InfoIcon";
import { useApiPlaygroundContext } from "./ApiPlaygroundContext";
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
    const { resolveTypeById } = useApiPlaygroundContext();

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
                <Select<APIV1Read.UndiscriminatedUnionVariant>
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
                                        <InfoIcon />
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
                            undiscriminatedUnion.variants.findIndex((v) => isEqual(v, variant)).toString(10)
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
                        rightIcon={<CaretDown />}
                        fill={true}
                    />
                </Select>
            )}
            {selectedVariant != null && (
                <div className="mt-2">
                    <PlaygroundTypeReferenceForm
                        typeReference={selectedVariant.type}
                        onChange={onChange}
                        value={value}
                        resolveTypeById={resolveTypeById}
                    />
                </div>
            )}
        </div>
    );
};
