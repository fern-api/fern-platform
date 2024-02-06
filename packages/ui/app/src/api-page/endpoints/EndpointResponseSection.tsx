import { ResolvedResponseBody } from "@fern-ui/app-utils";
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
            <div className="t-muted border-border-default-light dark:border-border-default-dark border-b pb-5 text-sm leading-6">
                {`This endpoint ${
                    responseBody.shape.type === "fileDownload"
                        ? "returns a file"
                        : responseBody.shape.type === "streamingText"
                          ? "sends text responses over a long-lived HTTP connection"
                          : responseBody.shape.type === "streamCondition"
                            ? "return a stream"
                            : `return ${renderTypeShorthand(responseBody.shape, { withArticle: true })}`
                }.`}
            </div>
            {responseBody.shape.type === "fileDownload" ||
            responseBody.shape.type === "streamingText" ||
            responseBody.shape.type === "streamCondition" ? null : (
                <TypeReferenceDefinitions
                    shape={responseBody.shape}
                    isCollapsible={false}
                    onHoverProperty={onHoverProperty}
                    anchorIdParts={anchorIdParts}
                    route={route}
                    defaultExpandAll={defaultExpandAll}
                    applyErrorStyles={false}
                />
            )}
        </div>
    );
};
