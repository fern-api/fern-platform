import { FernButton, FernButtonGroup } from "@fern-docs/components";
import { ReactElement } from "react";
import { ExampleWebhookPayload } from "../../../../../../fdr-sdk/src/client/APIV1Read";

export function WebhookExampleSegmentedControl({
  segmentedControlExamples,
  selectedExample,
  onSelectExample,
}: {
  segmentedControlExamples: {
    exampleKey: string;
    example: ExampleWebhookPayload;
  }[];
  selectedExample: ExampleWebhookPayload | undefined;
  onSelectExample: (exampleKey: string) => void;
}): ReactElement {
  return (
    <FernButtonGroup className="min-w-0 shrink">
      {segmentedControlExamples.map(({ exampleKey, example }) => {
        return (
          <FernButton
            key={exampleKey}
            rounded={true}
            onClick={() => {
              onSelectExample(exampleKey);
            }}
            className="min-w-0 shrink truncate"
            mono
            size="small"
            variant={exampleKey === example?.name ? "outlined" : "minimal"}
            intent={exampleKey === selectedExample?.name ? "primary" : "none"}
          >
            {exampleKey}
          </FernButton>
        );
      })}
    </FernButtonGroup>
  );
}
