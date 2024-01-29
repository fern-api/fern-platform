import { ResolvedResponseBody, visitResolvedHttpResponseBodyShape } from "@fern-ui/app-utils";
import { ApiPageDescription } from "../ApiPageDescription";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { renderTypeShorthand } from "../types/type-shorthand/TypeShorthand";

export declare namespace EndpointResponseSection {
    export interface Props {
        responseBody: ResolvedResponseBody;
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
        anchorIdParts: string[];
        route: string;
        defaultExpandAll?: boolean;
    }
}

export const EndpointResponseSection: React.FC<EndpointResponseSection.Props> = ({
    responseBody,
    onHoverProperty,
    anchorIdParts,
    route,
    defaultExpandAll = false,
}) => {
    return (
        <div className="flex flex-col">
            <ApiPageDescription className="mt-3 text-sm" description={responseBody.description} isMarkdown={true} />
            <div className="t-muted border-border-default-light dark:border-border-default-dark border-b pb-5 text-base leading-6">
                {`This endpoint ${visitResolvedHttpResponseBodyShape(responseBody.shape, {
                    fileDownload: () => "returns a file",
                    stream: (stream) =>
                        stream.shape.type === "streamingText"
                            ? "sends text responses over a long-lived HTTP connection"
                            : `returns a stream of ${renderTypeShorthand(stream.shape, {
                                  withArticle: true,
                                  plural: true,
                              })}`,
                    typeReference: (shape) => `returns ${renderTypeShorthand(shape, { withArticle: true })}`,
                })}`}
            </div>
            {visitResolvedHttpResponseBodyShape(responseBody.shape, {
                fileDownload: () => null,
                stream: (stream) =>
                    stream.shape.type === "streamingText" ? null : (
                        <TypeReferenceDefinitions
                            shape={stream.shape}
                            isCollapsible={false}
                            onHoverProperty={onHoverProperty}
                            anchorIdParts={anchorIdParts}
                            route={route}
                            defaultExpandAll={defaultExpandAll}
                            applyErrorStyles={false}
                        />
                    ),
                typeReference: (shape) => (
                    <TypeReferenceDefinitions
                        shape={shape}
                        isCollapsible={false}
                        onHoverProperty={onHoverProperty}
                        anchorIdParts={anchorIdParts}
                        route={route}
                        defaultExpandAll={defaultExpandAll}
                        applyErrorStyles={false}
                    />
                ),
            })}
        </div>
    );
};
