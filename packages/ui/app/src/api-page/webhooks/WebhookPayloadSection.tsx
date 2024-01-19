import { ResolvedWebhookPayload } from "@fern-ui/app-utils";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { renderTypeShorthand } from "../types/type-shorthand/TypeShorthand";

export declare namespace WebhookPayloadSection {
    export interface Props {
        payload: ResolvedWebhookPayload;
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
        anchorIdParts: string[];
        route: string;
    }
}

export const WebhookPayloadSection: React.FC<WebhookPayloadSection.Props> = ({
    payload,
    onHoverProperty,
    anchorIdParts,
    route,
}) => {
    return (
        <div className="flex flex-col">
            <div className="t-muted border-border-default-light dark:border-border-default-dark border-b pb-5 text-sm leading-6">
                {`The payload of this webhook request is ${renderTypeShorthand(payload.shape, { withArticle: true })}.`}
            </div>
            <TypeReferenceDefinitions
                shape={payload.shape}
                isCollapsible={false}
                onHoverProperty={onHoverProperty}
                anchorIdParts={anchorIdParts}
                applyErrorStyles={false}
                route={route}
            />
        </div>
    );
};
