import { APIV1Read } from "@fern-api/fdr-sdk";
import { CaretDownIcon } from "@radix-ui/react-icons";
import dynamic from "next/dynamic";
import { FC, useMemo } from "react";
import { FernButton } from "../components/FernButton";
import { FernDropdown } from "../components/FernDropdown";
import { FernSegmentedControl } from "../components/FernSegmentedControl";

const Markdown = dynamic(() => import("../api-page/markdown/Markdown").then(({ Markdown }) => Markdown), {
    ssr: true,
});

interface PlaygroundEnumFormProps {
    enumValues: APIV1Read.EnumValue[];
    onChange: (value: unknown) => void;
    value: unknown;
}

export const PlaygroundEnumForm: FC<PlaygroundEnumFormProps> = ({ enumValues, onChange, value }) => {
    const options = useMemo(
        () =>
            enumValues.map(
                (enumValue): FernDropdown.Option => ({
                    type: "value",
                    label: enumValue.value,
                    value: enumValue.value,
                    tooltip:
                        enumValue.description != null ? (
                            <Markdown className="text-xs">{enumValue.description}</Markdown>
                        ) : undefined,
                    className: "font-mono",
                }),
            ),
        [enumValues],
    );

    if (enumValues.length === 0) {
        return null;
    }

    if (enumValues.length < 3) {
        return (
            <div className="w-full">
                <FernSegmentedControl
                    options={options}
                    value={typeof value === "string" ? value : undefined}
                    onValueChange={onChange}
                />
            </div>
        );
    }

    const activeItem = enumValues.find((enumValue) => enumValue.value === value);

    return (
        <FernDropdown options={options} onValueChange={onChange} value={activeItem?.value}>
            <FernButton
                text={
                    activeItem != null ? (
                        <span className="font-mono">{activeItem.value}</span>
                    ) : (
                        <span className="t-muted">Select an enum...</span>
                    )
                }
                variant="outlined"
                rightIcon={<CaretDownIcon />}
                className="w-full text-left"
            />
        </FernDropdown>
    );
};
