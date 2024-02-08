import { APIV1Read } from "@fern-api/fdr-sdk";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { FC } from "react";
import { FernButton } from "../components/FernButton";
import { FernDropdown } from "../components/FernDropdown";
import { FernSegmentedControl } from "../components/FernSegmentedControl";

interface PlaygroundEnumFormProps {
    enumValues: APIV1Read.EnumValue[];
    onChange: (value: unknown) => void;
    value: unknown;
}

export const PlaygroundEnumForm: FC<PlaygroundEnumFormProps> = ({ enumValues, onChange, value }) => {
    if (enumValues.length === 0) {
        return null;
    }

    if (enumValues.length < 3) {
        return (
            <div className="w-full">
                <FernSegmentedControl
                    options={enumValues.map((enumValue) => ({
                        label: enumValue.value,
                        value: enumValue.value,
                    }))}
                    value={typeof value === "string" ? value : undefined}
                    onValueChange={onChange}
                />
            </div>
        );
    }

    const activeItem = enumValues.find((enumValue) => enumValue.value === value);

    return (
        <FernDropdown options={enumValues} onValueChange={onChange} value={activeItem?.value}>
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
