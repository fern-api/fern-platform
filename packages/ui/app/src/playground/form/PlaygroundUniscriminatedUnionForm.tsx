import { TypeDefinition, UndiscriminatedUnionType } from "@fern-api/fdr-sdk/api-definition";
import { FernButton, FernDropdown, FernSegmentedControl } from "@fern-ui/components";
import { NavArrowDown } from "iconoir-react";
import dynamic from "next/dynamic";
import { memo, useCallback, useMemo, useState } from "react";
import { getEmptyValueForType, matchesTypeReference } from "../utils";
import { PlaygroundTypeReferenceForm } from "./PlaygroundTypeReferenceForm";

const Markdown = dynamic(() => import("../../mdx/Markdown").then(({ Markdown }) => Markdown));

interface PlaygroundUniscriminatedUnionFormProps {
    undiscriminatedUnion: UndiscriminatedUnionType;
    onChange: (value: unknown) => void;
    value: unknown;
    id: string;
    types: Record<string, TypeDefinition>;
    disabled?: boolean;
}

export const PlaygroundUniscriminatedUnionForm = memo<PlaygroundUniscriminatedUnionFormProps>((props) => {
    const { undiscriminatedUnion, onChange, value, id, types, disabled } = props;
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
                onChange(getEmptyValueForType(variant.shape, types));
            }
        },
        [internalSelectedVariant, onChange, types, undiscriminatedUnion.variants],
    );

    const options = useMemo(
        () =>
            undiscriminatedUnion.variants.map((variant, idx): FernDropdown.Option => {
                let labelFallback: string;
                switch (variant.shape.type) {
                    case "literal":
                        labelFallback =
                            variant.shape.value.type === "booleanLiteral"
                                ? variant.shape.value.value
                                    ? "true"
                                    : "false"
                                : variant.shape.value.value;
                        break;
                    case "primitive":
                        labelFallback = variant.shape.value.type;
                        break;
                    case "optional":
                        labelFallback = variant.shape.shape.type;
                        break;
                    default:
                        labelFallback = variant.shape.type;
                        break;
                }
                return {
                    type: "value",
                    label: variant.displayName ?? labelFallback,
                    value: idx.toString(),
                    // todo: handle availability
                    tooltip: variant.description != null ? <Markdown size="xs" mdx={variant.description} /> : undefined,
                };
            }),
        [undiscriminatedUnion.variants],
    );

    const selectedOption = options
        .filter((option): option is FernDropdown.ValueOption => option.type === "value")
        .find((option) => option.value === internalSelectedVariant.toString());

    return (
        <div className="w-full">
            {undiscriminatedUnion.variants.length < 5 ? (
                <FernSegmentedControl
                    options={options}
                    value={internalSelectedVariant.toString()}
                    onValueChange={setSelectedVariant}
                    className="mb-4 w-full"
                    muted={disabled}
                />
            ) : (
                <FernDropdown
                    options={options}
                    onValueChange={setSelectedVariant}
                    value={internalSelectedVariant.toString()}
                >
                    <FernButton
                        text={
                            selectedOption != null ? (
                                <span className="font-mono">{selectedOption.label ?? selectedOption.value}</span>
                            ) : (
                                <span className="t-muted">Select a variant...</span>
                            )
                        }
                        rightIcon={<NavArrowDown />}
                        className="w-full text-left mb-4"
                        variant="outlined"
                        mono={true}
                        disabled={disabled}
                    />
                </FernDropdown>
            )}
            {selectedVariant != null && (
                <div className="border-l border-border-default-soft pl-4">
                    <PlaygroundTypeReferenceForm
                        id={`${id}[${internalSelectedVariant}]`}
                        shape={selectedVariant.shape}
                        onChange={onChange}
                        value={value}
                        types={types}
                        disabled={disabled}
                        indent={false}
                    />
                </div>
            )}
        </div>
    );
});

PlaygroundUniscriminatedUnionForm.displayName = "PlaygroundUniscriminatedUnionForm";
