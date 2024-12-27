import { FernButton, FernButtonGroup } from "@fern-docs/components";
import { ReactElement } from "react";
import { CodeExample } from "../examples/code-example";

export function EndpointExampleSegmentedControl({
  segmentedControlExamples,
  selectedExample,
  onSelectExample,
}: {
  segmentedControlExamples: {
    exampleKey: string;
    examples: CodeExample[];
  }[];
  selectedExample: CodeExample | undefined;
  onSelectExample: (exampleKey: string) => void;
}): ReactElement {
  // TODO: Replace this with a proper segmented control component
  return (
    <FernButtonGroup className="min-w-0 shrink">
      {segmentedControlExamples.map(({ exampleKey, examples }) => {
        const exampleIndex = examples[0]?.exampleIndex ?? 0;
        return (
          <FernButton
            key={exampleKey}
            rounded={true}
            onClick={() => {
              onSelectExample(exampleKey);
            }}
            className={
              "min-w-0 shrink truncate" +
              (exampleKey === selectedExample?.exampleKey
                ? " ring-primary-500"
                : " ring-transparent")
            }
            mono
            size="small"
            variant={"outlined"}
            intent={
              exampleKey === selectedExample?.exampleKey ? "primary" : "none"
            }
          >
            {(exampleKey === selectedExample?.exampleKey
              ? selectedExample?.name
              : undefined) ??
              examples[0]?.name ??
              examples[0]?.exampleCall.name ??
              `Example ${exampleIndex + 1}`}
          </FernButton>
        );
      })}
    </FernButtonGroup>
  );
}
