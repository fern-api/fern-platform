import { FernErrorTag } from "@fern-ui/components";
import { useDocsContext } from "../../contexts/docs-context/useDocsContext";
import { ResolvedResponseBody, ResolvedTypeDefinition, visitResolvedHttpResponseBodyShape } from "../../resolver/types";
import { ApiPageDescription } from "../ApiPageDescription";
import { JsonPropertyPath } from "../examples/JsonPropertyPath";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { renderTypeShorthand } from "../types/type-shorthand/TypeShorthand";

export declare namespace EndpointResponseSection {
    export interface Props {
        responseBody: ResolvedResponseBody;
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
        anchorIdParts: readonly string[];
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
    const { domain } = useDocsContext();
    return (
        <div>
            <ApiPageDescription className="mt-3 text-sm" description={responseBody.description} isMarkdown={true} />
            <div className="t-muted border-default border-b pb-5 text-sm leading-6">
                {getResponseSummary({ responseBody, types, domain })}
            </div>
            {visitResolvedHttpResponseBodyShape(responseBody.shape, {
                fileDownload: () => null,
                streamingText: () => {
                    // eslint-disable-next-line no-console
                    console.error(
                        "Generated API Reference contains a deprecated streamingText shape. Please upgrade Fern CLI and regenerate the API Reference.",
                    );
                    return (
                        <FernErrorTag component="EndpointResponseSection" error="Stream condition cannot be rendered" />
                    );
                },
                streamCondition: () => {
                    // eslint-disable-next-line no-console
                    console.error(
                        "Generated API Reference contains a deprecated streamCondition shape. Please upgrade Fern CLI and regenerate the API Reference.",
                    );
                    return (
                        <FernErrorTag component="EndpointResponseSection" error="Stream condition cannot be rendered" />
                    );
                },
                stream: (stream) => (
                    <TypeReferenceDefinitions
                        shape={stream.value}
                        isCollapsible={false}
                        onHoverProperty={onHoverProperty}
                        anchorIdParts={anchorIdParts}
                        route={route}
                        defaultExpandAll={defaultExpandAll}
                        applyErrorStyles={false}
                        types={types}
                        isResponse={true}
                    />
                ),
                typeShape: (typeShape) => (
                    <TypeReferenceDefinitions
                        shape={typeShape}
                        isCollapsible={false}
                        onHoverProperty={onHoverProperty}
                        anchorIdParts={anchorIdParts}
                        route={route}
                        defaultExpandAll={defaultExpandAll}
                        applyErrorStyles={false}
                        types={types}
                        isResponse={true}
                    />
                ),
            })}
        </div>
    );
};

function getResponseSummary({
    responseBody,
    types,
    domain,
}: {
    responseBody: ResolvedResponseBody;
    types: Record<string, ResolvedTypeDefinition>;
    domain: string;
}) {
    if (responseBody.shape.type === "fileDownload") {
        if (domain.includes("elevenlabs")) {
            return (
                <span>
                    This endpoint returns an <code>audio/mpeg</code> file.
                </span>
            );
        }
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
