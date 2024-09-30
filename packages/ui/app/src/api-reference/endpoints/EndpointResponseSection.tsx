import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { useFeatureFlags } from "../../atoms";
import { FernErrorTag } from "../../components/FernErrorBoundary";
import { Markdown } from "../../mdx/Markdown";
import { ResolvedResponseBody, ResolvedTypeDefinition, visitResolvedHttpResponseBodyShape } from "../../resolver/types";
import { JsonPropertyPath } from "../examples/JsonPropertyPath";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { renderDeprecatedTypeShorthand } from "../types/type-shorthand/TypeShorthand";

export declare namespace EndpointResponseSection {
    export interface Props {
        responseBody: ResolvedResponseBody;
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
        anchorIdParts: readonly string[];
        slug: FernNavigation.Slug;
        types: Record<string, ResolvedTypeDefinition>;
    }
}

export const EndpointResponseSection: React.FC<EndpointResponseSection.Props> = ({
    responseBody,
    onHoverProperty,
    anchorIdParts,
    slug,
    types,
}) => {
    const { isAudioFileDownloadSpanSummary } = useFeatureFlags();

    return (
        <div>
            <Markdown
                size="sm"
                className="!t-muted border-default border-b pb-5 leading-6"
                mdx={responseBody.description}
                fallback={getResponseSummary({ responseBody, types, isAudioFileDownloadSpanSummary })}
            />
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
                        slug={slug}
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
                        slug={slug}
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
    isAudioFileDownloadSpanSummary,
}: {
    responseBody: ResolvedResponseBody;
    types: Record<string, ResolvedTypeDefinition>;
    isAudioFileDownloadSpanSummary: boolean;
}) {
    if (responseBody.shape.type === "fileDownload") {
        if (isAudioFileDownloadSpanSummary) {
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
        return `This endpoint returns a stream of ${renderDeprecatedTypeShorthand(responseBody.shape.value, { withArticle: false }, types)}.`;
    }
    return `This endpoint returns ${renderDeprecatedTypeShorthand(responseBody.shape, { withArticle: true }, types)}.`;
}
