import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { unwrapReference } from "@fern-api/fdr-sdk/api-definition";
import { ReactElement, useMemo } from "react";
import { ExplorerObjectForm } from "../form/ExplorerObjectForm";
import { ExplorerTypeReferenceForm } from "../form/ExplorerTypeReferenceForm";
import { ExplorerEndpointFormSection } from "./ExplorerEndpointFormSection";

interface ExplorerEndpointAliasFormProps {
  alias: ApiDefinition.HttpRequestBodyShape.Alias;
  types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
  ignoreHeaders: boolean;
  setBodyJson: (value: unknown) => void;
  value: unknown;
}

export function ExplorerEndpointAliasForm({
  alias,
  types,
  ignoreHeaders,
  setBodyJson,
  value,
}: ExplorerEndpointAliasFormProps): ReactElement {
  const { shape, isOptional } = useMemo(
    () => unwrapReference(alias.value, types),
    [alias.value, types]
  );

  if (shape.type === "object" && !isOptional) {
    return (
      <ExplorerEndpointFormSection
        ignoreHeaders={ignoreHeaders}
        title="Body Parameters"
      >
        <ExplorerObjectForm
          id="body"
          shape={shape}
          onChange={setBodyJson}
          value={value}
          types={types}
        />
      </ExplorerEndpointFormSection>
    );
  }
  return (
    <ExplorerEndpointFormSection
      ignoreHeaders={ignoreHeaders}
      title={isOptional ? "Optional Body" : "Body"}
    >
      <ExplorerTypeReferenceForm
        id="body"
        shape={shape}
        onChange={setBodyJson}
        value={value}
        types={types}
      />
    </ExplorerEndpointFormSection>
  );
}
