import dynamic from "next/dynamic";
import { memo, useCallback, useMemo, useState } from "react";

import { ChevronDown } from "lucide-react";

import {
  TypeDefinition,
  UndiscriminatedUnionType,
} from "@fern-api/fdr-sdk/api-definition";
import {
  FernButton,
  FernDropdown,
  FernSegmentedControl,
} from "@fern-docs/components";

import { renderTypeShorthand } from "../../type-shorthand";
import { getEmptyValueForType, matchesTypeReference } from "../utils";
import { PlaygroundTypeReferenceForm } from "./PlaygroundTypeReferenceForm";

const Markdown = dynamic(() =>
  import("../../../mdx/components/Markdown").then(({ Markdown }) => Markdown)
);

interface PlaygroundUniscriminatedUnionFormProps {
  undiscriminatedUnion: UndiscriminatedUnionType;
  onChange: (value: unknown) => void;
  value: unknown;
  id: string;
  types: Record<string, TypeDefinition>;
  disabled?: boolean;
}

export const PlaygroundUniscriminatedUnionForm =
  memo<PlaygroundUniscriminatedUnionFormProps>((props) => {
    const { undiscriminatedUnion, onChange, value, id, types, disabled } =
      props;
    const [internalSelectedVariant, setInternalSelectedVariant] =
      useState<number>(() => {
        return Math.max(
          undiscriminatedUnion.variants.findIndex((variant) =>
            matchesTypeReference(variant.shape, value, types)
          ),
          0
        );
      });

    const selectedVariant =
      undiscriminatedUnion.variants[internalSelectedVariant];

    const setSelectedVariant = useCallback(
      (variantIdxAsString: string) => {
        const variantIdx = parseInt(variantIdxAsString, 10);
        const variant = undiscriminatedUnion.variants[variantIdx];
        if (variantIdx !== internalSelectedVariant && variant != null) {
          setInternalSelectedVariant(variantIdx);
          onChange(getEmptyValueForType(variant.shape, types));
        }
      },
      [internalSelectedVariant, onChange, types, undiscriminatedUnion.variants]
    );

    const options = useMemo(
      () =>
        undiscriminatedUnion.variants.map(
          (variant, idx): FernDropdown.Option => {
            return {
              type: "value",
              label:
                variant.displayName ??
                renderTypeShorthand(variant.shape, {}, types),
              value: idx.toString(),
              // todo: handle availability
              tooltip:
                variant.description != null ? (
                  <Markdown size="xs" mdx={variant.description} />
                ) : undefined,
            };
          }
        ),
      [types, undiscriminatedUnion.variants]
    );

    const selectedOption = options
      .filter(
        (option): option is FernDropdown.ValueOption => option.type === "value"
      )
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
                  <span className="font-mono">
                    {selectedOption.label ?? selectedOption.value}
                  </span>
                ) : (
                  <span className="text-(color:--grayscale-a11)">
                    Select a variant...
                  </span>
                )
              }
              rightIcon={<ChevronDown className="size-icon" />}
              className="mb-4 w-full text-left"
              variant="outlined"
              mono={true}
              disabled={disabled}
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
              disabled={disabled}
              indent={false}
            />
          </div>
        )}
      </div>
    );
  });

PlaygroundUniscriminatedUnionForm.displayName =
  "PlaygroundUniscriminatedUnionForm";
