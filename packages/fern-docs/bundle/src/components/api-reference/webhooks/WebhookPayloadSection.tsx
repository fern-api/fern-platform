import "server-only";

import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";

import { DocsLoader } from "@/server/docs-loader";

import { renderTypeShorthand } from "../../type-shorthand";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";

export function WebhookPayloadSection({
  loader,
  payload,
  anchorIdParts,
  slug,
  types,
}: {
  loader: DocsLoader;
  payload: ApiDefinition.WebhookPayload;
  anchorIdParts: readonly string[];
  slug: FernNavigation.Slug;
  types: Record<string, ApiDefinition.TypeDefinition>;
}) {
  return (
    <div className="flex flex-col">
      <div className="t-muted border-default border-b pb-5 text-sm leading-6">
        {`The payload of this webhook request is ${renderTypeShorthand(payload.shape, { withArticle: true }, types)}.`}
      </div>
      <TypeReferenceDefinitions
        loader={loader}
        shape={payload.shape}
        isCollapsible={false}
        anchorIdParts={anchorIdParts}
        slug={slug}
        types={types}
      />
    </div>
  );
}
