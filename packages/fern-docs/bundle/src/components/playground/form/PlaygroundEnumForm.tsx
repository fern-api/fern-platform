import dynamic from "next/dynamic";
import { memo, useMemo } from "react";

import { sortBy } from "es-toolkit/array";
import { ChevronDown } from "lucide-react";

import { EnumValue } from "@fern-api/fdr-sdk/api-definition";
import { FernButton, FernDropdown } from "@fern-docs/components";

const Markdown = dynamic(() =>
  import("@/mdx/components/Markdown").then(({ Markdown }) => Markdown)
);

interface PlaygroundEnumFormProps {
  enumValues: EnumValue[];
  onChange: (value: unknown) => void;
  value: unknown;
  id: string;
  onFocus?: () => void;
  disabled?: boolean;
}

export const PlaygroundEnumForm = memo<PlaygroundEnumFormProps>((props) => {
  const { enumValues, onChange, value, id, onFocus, disabled } = props;
  const options = useMemo(
    () =>
      sortBy(enumValues, ["value"]).map(
        (enumValue): FernDropdown.Option => ({
          type: "value",
          label: enumValue.value,
          helperText: (
            <Markdown mdx={enumValue.description} className="!text-xs" />
          ),
          value: enumValue.value,
          // tooltip:
          //     enumValue.description != null && enumValues.length >= ENUM_RADIO_BREAKPOINT ? (
          //         <Markdown size="xs">{enumValue.description}</Markdown>
          //     ) : undefined,
          labelClassName: "font-mono",
        })
      ),
    [enumValues]
  );

  if (enumValues.length === 0) {
    return null;
  }

  // if (enumValues.length < ENUM_RADIO_BREAKPOINT) {
  //     return (
  //         <div className="w-full">
  //             <FernRadioGroup
  //                 options={options}
  //                 value={typeof value === "string" ? value : undefined}
  //                 onValueChange={onChange}
  //                 compact={true}
  //             />
  //         </div>
  //     );
  // }

  const activeItem = enumValues.find((enumValue) => enumValue.value === value);

  return (
    <FernDropdown
      options={options}
      onValueChange={onChange}
      value={activeItem?.value}
      onOpen={onFocus}
    >
      <FernButton
        id={id}
        text={
          activeItem != null ? (
            <span className="font-mono">{activeItem.value}</span>
          ) : (
            <span className="text-(color:--grayscale-a11)">
              Select an enum...
            </span>
          )
        }
        variant="outlined"
        rightIcon={<ChevronDown />}
        className="w-full text-left"
        disabled={disabled}
      />
    </FernDropdown>
  );
});

PlaygroundEnumForm.displayName = "PlaygroundEnumForm";
