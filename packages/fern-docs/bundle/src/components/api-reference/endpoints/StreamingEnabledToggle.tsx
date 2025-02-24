import { FC, PropsWithChildren, useCallback } from "react";

import { Layers2, Radio } from "lucide-react";

import { FernDropdown, FernSegmentedControl } from "@fern-docs/components";

export declare namespace StreamingEnabledToggle {
  export interface Props {
    value: boolean;
    setValue: (enabled: boolean) => void;
    className?: string;
  }
}

const OPTIONS: FernDropdown.Option[] = [
  { type: "value", value: "batch", label: "Batch", icon: <Layers2 /> },
  {
    type: "value",
    value: "stream",
    label: "Stream",
    icon: <Radio />,
  },
];

export const StreamingEnabledToggle: FC<
  PropsWithChildren<StreamingEnabledToggle.Props>
> = ({ value, setValue, className }) => {
  return (
    <FernSegmentedControl
      options={OPTIONS}
      onValueChange={useCallback(
        (value) => setValue(value === "stream"),
        [setValue]
      )}
      value={value ? "stream" : "batch"}
      className={className}
    />
  );
};
