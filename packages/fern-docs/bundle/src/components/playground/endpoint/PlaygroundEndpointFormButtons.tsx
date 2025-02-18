import { ReactElement } from "react";

import { ArrowUpRight } from "iconoir-react";

import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FernButton, FernButtonGroup } from "@fern-docs/components";

import { useNode } from "@/state/navigation";

import { FernLink } from "../../components/FernLink";

const USE_EXAMPLE_TEXT = "Use example";
const CLEAR_FORM_TEXT = "Clear form";

interface PlaygroundEndpointFormButtonsProps {
  node: FernNavigation.EndpointNode;
  resetWithExample: () => void;
  resetWithoutExample: () => void;
}

export function PlaygroundEndpointFormButtons({
  node,
  resetWithExample,
  resetWithoutExample,
}: PlaygroundEndpointFormButtonsProps): ReactElement<any> {
  const { current } = useNode();
  const apiReferenceId = FernNavigation.utils.getApiReferenceId(current);
  return (
    <div className="flex items-center justify-between">
      <FernButtonGroup>
        <FernButton onClick={resetWithExample} size="small" variant="minimal">
          {USE_EXAMPLE_TEXT}
        </FernButton>
        <FernButton
          onClick={resetWithoutExample}
          size="small"
          variant="minimal"
        >
          {CLEAR_FORM_TEXT}
        </FernButton>
      </FernButtonGroup>

      <FernLink
        href={`/${node.slug}`}
        shallow={apiReferenceId === node.apiDefinitionId}
        className="text-muted hover:t-accent inline-flex items-center gap-1 text-sm font-semibold underline decoration-1 underline-offset-4 hover:decoration-2"
      >
        <span>View in API Reference</span>
        <ArrowUpRight className="size-icon" />
      </FernLink>
    </div>
  );
}
