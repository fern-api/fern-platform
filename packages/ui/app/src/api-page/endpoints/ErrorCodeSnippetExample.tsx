import { EMPTY_OBJECT } from "@fern-ui/core-utils";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { ReactElement, ReactNode, useMemo, useState } from "react";
import { FernButton } from "../../components/FernButton";
import { FernDropdown } from "../../components/FernDropdown";
import { FernTag } from "../../components/FernTag";
import { ResolvedError, ResolvedExampleError } from "../../resolver/types";
import { JsonCodeSnippetExample } from "../examples/CodeSnippetExample";

export interface ErrorCodeSnippetExampleProps {
    successfulResponseTitle?: ReactNode;
    selectedError: ResolvedError;
    errors: ResolvedError[];
    setSelectedError: (error: ResolvedError | undefined) => void;
}

export function ErrorCodeSnippetExample({
    selectedError,
    errors,
    setSelectedError,
}: ErrorCodeSnippetExampleProps): ReactElement | null {
    const [selectedExample, setSelectedExample] = useState<ResolvedExampleError | undefined>(selectedError.examples[0]);
    const selectedIndex = selectedExample != null ? selectedError.examples.indexOf(selectedExample) : -1;

    const handleValueChange = (value: string) => {
        setSelectedExample(selectedError.examples[parseInt(value, 10)]);
    };

    const value = selectedExample?.responseBody ?? EMPTY_OBJECT;

    const options = useMemo(
        () =>
            selectedError.examples.map((example, idx): FernDropdown.Option => {
                return {
                    type: "value",
                    value: `${idx}`,
                    label: example.name,
                    helperText: example.description,
                };
            }),
        [selectedError.examples],
    );

    return (
        <JsonCodeSnippetExample
            title={
                <span className="inline-flex items-center">
                    <FernTag colorScheme="red">{selectedError.statusCode}</FernTag>
                    {options.length === 0 ? (
                        <span className="ml-2 text-sm text-intent-danger">{selectedError.name}</span>
                    ) : (
                        <FernDropdown options={options} value={`${selectedIndex}`} onValueChange={handleValueChange}>
                            <FernButton variant="minimal" intent="danger" rightIcon={<CaretDownIcon />}>
                                {selectedExample?.name}
                            </FernButton>
                        </FernDropdown>
                    )}
                </span>
            }
            intent={
                selectedError.statusCode >= 400 ? "danger" : selectedError.statusCode >= 300 ? "warning" : "default"
            }
            onClick={(e) => {
                e.stopPropagation();
            }}
            json={value}
        />
    );
}
