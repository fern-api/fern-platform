import { ResolvedPayload, ResolvedTypeDefinition } from "../../resolver/types";
import { JsonPropertyPath } from "../examples/JsonPropertyPath";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { renderTypeShorthand } from "../types/type-shorthand/TypeShorthand";

export declare namespace WebhookPayloadSection {
    export interface Props {
        payload: ResolvedPayload;
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
        anchorIdParts: readonly string[];
        route: string;
        types: Record<string, ResolvedTypeDefinition>;
    }
}

export const WebhookPayloadSection: React.FC<WebhookPayloadSection.Props> = ({
    payload,
    onHoverProperty,
    anchorIdParts,
    route,
    types,
}) => {
    return (
        <div className="flex flex-col">
            <div className="t-muted border-default border-b pb-5 text-sm leading-6">
                {`The payload of this webhook request is ${renderTypeShorthand(payload.shape, { withArticle: true }, types)}.`}
            </div>
            <TypeReferenceDefinitions
                shape={payload.shape}
                isCollapsible={false}
                onHoverProperty={onHoverProperty}
                anchorIdParts={anchorIdParts}
                applyErrorStyles={false}
                route={route}
                types={types}
            />
        </div>
    );
};
