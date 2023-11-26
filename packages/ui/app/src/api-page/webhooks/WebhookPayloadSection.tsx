import * as FernRegistryApiRead from "@fern-api/fdr-sdk/dist/generated/api/resources/api/resources/v1/resources/read";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { ReactElement } from "react";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { TypeDefinition } from "../types/type-definition/TypeDefinition";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { TypeShorthand } from "../types/type-shorthand/TypeShorthand";

export declare namespace WebhookPayloadSection {
    export interface Props {
        payload: FernRegistryApiRead.WebhookPayload;
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
                {"The payload of this webhook request is "}
                {visitDiscriminatedUnion(payload.type, "type")._visit<ReactElement | string>({
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
                        route={route}
                    />
                ),
                reference: (type) => (
                    <TypeReferenceDefinitions
                        type={type.value}
                        isCollapsible={false}
                        onHoverProperty={onHoverProperty}
                        anchorIdParts={anchorIdParts}
                        applyErrorStyles={false}
                        route={route}
                    />
                ),
                _other: () => null,
            })}
        </div>
    );
};
