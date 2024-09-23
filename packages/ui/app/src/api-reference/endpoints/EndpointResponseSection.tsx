import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { useFeatureFlags } from "../../atoms";
import { FernErrorTag } from "../../components/FernErrorBoundary";
import { Markdown } from "../../mdx/Markdown";
import { JsonPropertyPath } from "../examples/JsonPropertyPath";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { renderTypeShorthand } from "../types/type-shorthand/TypeShorthand";

export declare namespace EndpointResponseSection {
    export interface Props {
        response: ApiDefinition.HttpResponse;
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
        anchorIdParts: readonly string[];
        slug: FernNavigation.Slug;
        types: Record<string, ApiDefinition.TypeDefinition>;
    }
}

export const EndpointResponseSection: React.FC<EndpointResponseSection.Props> = ({
    response,
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
                mdx={response.description}
                fallback={getResponseSummary({ response, types, isAudioFileDownloadSpanSummary })}
            />
            {visitApiDefinition.HttpResponseBodyShape(response.shape, {
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
    response,
    types,
    isAudioFileDownloadSpanSummary,
}: {
    response: ApiDefinition.HttpResponse;
    types: Record<string, ApiDefinition.TypeDefinition>;
    isAudioFileDownloadSpanSummary: boolean;
}) {
    if (response.body.type === "fileDownload") {
        if (isAudioFileDownloadSpanSummary) {
            return (
                <span>
                    This endpoint returns an <code>audio/mpeg</code> file.
                </span>
            );
        }
        return "This endpoint returns a file.";
    } else if (response.body.type === "streamingText") {
        return "This endpoint sends text responses over a long-lived HTTP connection.";
    } else if (response.body.type === "stream") {
        return `This endpoint returns a stream of ${renderTypeShorthand(response.body.value, types, { withArticle: false })}.`;
    }
    return `This endpoint returns ${renderTypeShorthand(response.body, types, { withArticle: true })}.`;
}
