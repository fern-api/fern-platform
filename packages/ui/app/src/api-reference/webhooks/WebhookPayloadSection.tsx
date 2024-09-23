import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { JsonPropertyPath } from "../examples/JsonPropertyPath";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { renderTypeShorthand } from "../types/type-shorthand/TypeShorthand";

export declare namespace WebhookPayloadSection {
    export interface Props {
        payload: ApiDefinition.WebhookPayload;
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
        anchorIdParts: readonly string[];
        slug: FernNavigation.Slug;
        types: Record<string, ApiDefinition.TypeDefinition>;
    }
}

export const WebhookPayloadSection: React.FC<WebhookPayloadSection.Props> = ({
    payload,
    onHoverProperty,
    anchorIdParts,
    slug,
    types,
}) => {
    return (
        <div className="flex flex-col">
            <div className="t-muted border-default border-b pb-5 text-sm leading-6">
                {`The payload of this webhook request is ${renderTypeShorthand(payload.body, { withArticle: true }, types)}.`}
            </div>
            <TypeReferenceDefinitions
                shape={payload.body}
                isCollapsible={false}
                onHoverProperty={onHoverProperty}
                anchorIdParts={anchorIdParts}
                applyErrorStyles={false}
                slug={slug}
                types={types}
            />
        </div>
    );
};
