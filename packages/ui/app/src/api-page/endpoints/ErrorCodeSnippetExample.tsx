import { CaretDownIcon } from "@radix-ui/react-icons";
import { ReactElement, useMemo, useState } from "react";
import { FernButton } from "../../components/FernButton";
import { FernDropdown } from "../../components/FernDropdown";
import { FernTag } from "../../components/FernTag";
import { ResolvedError, ResolvedExampleError } from "../../resolver/types";
import { CodeSnippetExample } from "../examples/CodeSnippetExample";

export interface ErrorCodeSnippetExampleProps {
    resolvedError: ResolvedError;
    defaultValue: unknown;
}

export function ErrorCodeSnippetExample({
    resolvedError,
    defaultValue,
}: ErrorCodeSnippetExampleProps): ReactElement | null {
    const [selectedExample, setSelectedExample] = useState<ResolvedExampleError | undefined>(resolvedError.examples[0]);
    const selectedIndex = selectedExample != null ? resolvedError.examples.indexOf(selectedExample) : -1;

    const handleValueChange = (value: string) => {
        setSelectedExample(resolvedError.examples[parseInt(value, 10)]);
    };

    const value = selectedExample?.responseBody ?? defaultValue ?? "";

    const options = useMemo(
        () =>
            resolvedError.examples.map((example, idx): FernDropdown.Option => {
                return {
                    type: "value",
                    value: `${idx}`,
                    label: example.name,
                    helperText: example.description,
                };
            }),
        [resolvedError.examples],
    );

    return (
        <CodeSnippetExample
            title={
                <span className="inline-flex items-center">
                    <FernTag intent="danger">{resolvedError.statusCode}</FernTag>
                    {options.length === 0 ? (
                        <span className="ml-2 text-sm text-intent-danger">{resolvedError.name}</span>
                    ) : (
                        <FernDropdown options={options} value={`${selectedIndex}`} onValueChange={handleValueChange}>
                            <FernButton variant="minimal" rightIcon={<CaretDownIcon />}>
                                {selectedExample?.name}
                            </FernButton>
                        </FernDropdown>
                    )}
                </span>
            }
            isError={resolvedError.statusCode >= 400}
            onClick={(e) => {
                e.stopPropagation();
            }}
            code={JSON.stringify(value, null, 2)}
            language="json"
            json={value}
        />
    );
}
