import { ResolvedResponseBody, ResolvedTypeDefinition } from "../../util/resolver";
import { ApiPageDescription } from "../ApiPageDescription";
import { JsonPropertyPath } from "../examples/JsonPropertyPath";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { renderTypeShorthand } from "../types/type-shorthand/TypeShorthand";

export declare namespace EndpointResponseSection {
    export interface Props {
        responseBody: ResolvedResponseBody;
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
        anchorIdParts: string[];
        route: string;
        defaultExpandAll?: boolean;
        types: Record<string, ResolvedTypeDefinition>;
    }
}

export const EndpointResponseSection: React.FC<EndpointResponseSection.Props> = ({
    responseBody,
    onHoverProperty,
    anchorIdParts,
    route,
    defaultExpandAll = false,
    types,
}) => {
    return (
        <div>
            <ApiPageDescription className="mt-3 text-sm" description={responseBody.description} isMarkdown={true} />
            <div className="t-muted border-default border-b pb-5 text-sm leading-6">
                {getResponseSummary({ responseBody, types })}
            </div>
            {responseBody.shape.type === "fileDownload" ||
            responseBody.shape.type === "streamingText" ||
            responseBody.shape.type === "streamCondition" ? null : (
                <TypeReferenceDefinitions
                    shape={responseBody.shape.type === "stream" ? responseBody.shape.value : responseBody.shape}
                    isCollapsible={false}
                    onHoverProperty={onHoverProperty}
                    anchorIdParts={anchorIdParts}
                    route={route}
                    defaultExpandAll={defaultExpandAll}
                    applyErrorStyles={false}
                    types={types}
                    isResponse={true}
                />
            )}
        </div>
    );
};

function getResponseSummary({
    responseBody,
    types,
}: {
    responseBody: ResolvedResponseBody;
    types: Record<string, ResolvedTypeDefinition>;
}) {
    if (responseBody.shape.type === "fileDownload") {
        return "This endpoint returns a file.";
    } else if (responseBody.shape.type === "streamingText") {
        return "This endpoint sends text responses over a long-lived HTTP connection.";
    } else if (responseBody.shape.type === "streamCondition") {
        return "This endpoint returns a stream.";
    } else if (responseBody.shape.type === "stream") {
        return `This endpoint returns a stream of ${renderTypeShorthand(responseBody.shape.value, { withArticle: false }, types)}`;
    }
    return `This endpoint returns ${renderTypeShorthand(responseBody.shape, { withArticle: true }, types)}`;
}
