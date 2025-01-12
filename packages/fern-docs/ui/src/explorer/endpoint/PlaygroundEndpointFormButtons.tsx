import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FernButton, FernButtonGroup } from "@fern-docs/components";
import { ArrowUpRight } from "iconoir-react";
import { useAtomValue } from "jotai";
import { ReactElement } from "react";
import { CURRENT_NODE_ATOM, useCloseExplorer } from "../../atoms";
import { FernLink } from "../../components/FernLink";

const USE_EXAMPLE_TEXT = "Use example";
const CLEAR_FORM_TEXT = "Clear form";

interface ExplorerEndpointFormButtonsProps {
  node: FernNavigation.EndpointNode;
  resetWithExample: () => void;
  resetWithoutExample: () => void;
}

export function ExplorerEndpointFormButtons({
  node,
  resetWithExample,
  resetWithoutExample,
}: ExplorerEndpointFormButtonsProps): ReactElement {
  const activeNavigatable = useAtomValue(CURRENT_NODE_ATOM);
  const apiReferenceId =
    FernNavigation.utils.getApiReferenceId(activeNavigatable);
  const closeExplorer = useCloseExplorer();
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
        className="t-muted hover:t-accent inline-flex items-center gap-1 text-sm font-semibold underline decoration-1 underline-offset-4 hover:decoration-2"
        onClick={closeExplorer}
      >
        <span>View in API Reference</span>
        <ArrowUpRight className="size-icon" />
      </FernLink>
    </div>
  );
}
