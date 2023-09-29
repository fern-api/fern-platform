import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { TypeDefinition } from "../types/type-definition/TypeDefinition";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { TypeShorthand } from "../types/type-shorthand/TypeShorthand";

export declare namespace WebhookPayloadSection {
    export interface Props {
        payload: FernRegistryApiRead.WebhookPayload;
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
        anchorIdParts: string[];
    }
}

export const WebhookPayloadSection: React.FC<WebhookPayloadSection.Props> = ({
    payload,
    onHoverProperty,
    anchorIdParts,
}) => {
    return (
        <div className="flex flex-col">
            <div className="t-muted border-border-default-light dark:border-border-default-dark border-b pb-5 text-sm leading-6">
                {"The payload of this webhook request is "}
                {visitDiscriminatedUnion(payload.type, "type")._visit<JSX.Element | string>({
                    object: () => "an object",
                    reference: (type) => <TypeShorthand type={type.value} plural={false} withArticle />,
                    _other: () => "unknown",
                })}
                .
            </div>
            {visitDiscriminatedUnion(payload.type, "type")._visit({
                object: (object) => (
                    <TypeDefinition
                        typeShape={object}
                        isCollapsible={false}
                        onHoverProperty={onHoverProperty}
                        anchorIdParts={anchorIdParts}
                    />
                ),
                reference: (type) => (
                    <TypeReferenceDefinitions
                        type={type.value}
                        isCollapsible={false}
                        onHoverProperty={onHoverProperty}
                        anchorIdParts={anchorIdParts}
                        isError={false}
                    />
                ),
                _other: () => null,
            })}
        </div>
    );
};
