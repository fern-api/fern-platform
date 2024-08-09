import { FernDropdown, FernSegmentedControl } from "@fern-ui/components";
import { NetworkDevice, Rss } from "@fern-ui/icons";
import { FC, PropsWithChildren, useCallback } from "react";

export declare namespace StreamingEnabledToggle {
    export interface Props {
        value: boolean;
        setValue: (enabled: boolean) => void;
        className?: string;
    }
}

const OPTIONS: FernDropdown.Option[] = [
    { type: "value", value: "batch", label: "Batch", icon: <NetworkDevice /> },
    { type: "value", value: "stream", label: "Stream", icon: <Rss className="-rotate-45" /> },
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
