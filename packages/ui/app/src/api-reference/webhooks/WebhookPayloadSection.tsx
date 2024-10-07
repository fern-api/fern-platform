import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { ResolvedPayload, ResolvedTypeDefinition } from "../../resolver/types";
import { JsonPropertyPath } from "../examples/JsonPropertyPath";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { renderDeprecatedTypeShorthand } from "../types/type-shorthand/TypeShorthand";

export declare namespace WebhookPayloadSection {
    export interface Props {
        payload: ResolvedPayload;
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
        anchorIdParts: readonly string[];
        slug: FernNavigation.Slug;
        types: Record<string, ResolvedTypeDefinition>;
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
                {`The payload of this webhook request is ${renderDeprecatedTypeShorthand(payload.shape, { withArticle: true }, types)}.`}
            </div>
            <TypeReferenceDefinitions
                shape={payload.shape}
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
