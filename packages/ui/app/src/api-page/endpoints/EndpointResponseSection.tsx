import { APIV1Read } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { ReactElement } from "react";
import { ApiPageDescription } from "../ApiPageDescription";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { TypeDefinition } from "../types/type-definition/TypeDefinition";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { TypeShorthand } from "../types/type-shorthand/TypeShorthand";

export declare namespace EndpointResponseSection {
    export interface Props {
        httpResponse: APIV1Read.HttpResponse;
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
        anchorIdParts: string[];
        route: string;
    }
}

export const EndpointResponseSection: React.FC<EndpointResponseSection.Props> = ({
    httpResponse,
    onHoverProperty,
    anchorIdParts,
    route,
}) => {
    return (
        <div className="flex flex-col">
            <ApiPageDescription description={httpResponse.description} isMarkdown={true} />
            <div className="t-muted border-border-default-light dark:border-border-default-dark border-b pb-5 leading-6">
                {"This endpoint "}
                {visitDiscriminatedUnion(httpResponse.type, "type")._visit<ReactElement | string>({
                    object: () => "returns an object",
                    reference: (type) => (
                        <>
                            returns <TypeShorthand type={type.value} plural={false} withArticle />
                        </>
                    ),
                    fileDownload: () => "returns a file",
                    streamingText: () => "sends text responses over a long-lived HTTP connection",
                    streamCondition: () => "returns a stream",
                    _other: () => "unknown",
                })}
                .
            </div>
            {visitDiscriminatedUnion(httpResponse.type, "type")._visit({
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
                fileDownload: () => null,
                streamingText: () => null,
                streamCondition: () => null,
                _other: () => null,
            })}
        </div>
    );
};
