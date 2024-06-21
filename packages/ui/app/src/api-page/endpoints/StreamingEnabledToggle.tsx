import { FernDropdown, FernSegmentedControl } from "@fern-ui/components";
import { FC, PropsWithChildren, useCallback } from "react";
// import { AppleShortcuts } from "../../icons/apple-shortcuts";
// import { RadioSignal } from "../../icons/radio-signal";
import { AntennaSignal, AppleShortcuts } from "iconoir-react";

export declare namespace StreamingEnabledToggle {
    export interface Props {
        value: boolean;
        setValue: (enabled: boolean) => void;
        className?: string;
    }
}

const OPTIONS: FernDropdown.Option[] = [
    { type: "value", value: "batch", label: "Batch", icon: <AppleShortcuts /> },
    { type: "value", value: "stream", label: "Stream", icon: <AntennaSignal /> },
];

export const StreamingEnabledToggle: FC<PropsWithChildren<StreamingEnabledToggle.Props>> = ({
    value,
    setValue,
    className,
}) => {
    return (
        <FernSegmentedControl
            options={OPTIONS}
            onValueChange={useCallback((value) => setValue(value === "stream"), [setValue])}
            value={value ? "stream" : "batch"}
            className={className}
        />
    );
};
