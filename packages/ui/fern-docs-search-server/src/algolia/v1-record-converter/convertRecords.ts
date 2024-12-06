import { Algolia } from "@fern-api/fdr-sdk";
import { EndpointDefinition, TypeDefinition } from "@fern-api/fdr-sdk/api-definition";
import { truncateToBytes } from "@fern-api/ui-core-utils";
import { generateEndpointContent } from "./generateEndpointContent";

export function convertEndpointV4ToV3(
    endpoint: Algolia.AlgoliaRecord.EndpointV4,
    endpointDefinition: EndpointDefinition,
    types: Record<string, TypeDefinition>,
): Algolia.AlgoliaRecord.EndpointV3 {
    return {
        type: "endpoint-v3",
        method: endpoint.method,
        endpointPath: endpoint.endpointPath,
        isResponseStream: endpoint.isResponseStream,
        title: endpoint.title,
        content: truncateToBytes(generateEndpointContent(endpointDefinition, types), 50 * 1000),
        breadcrumbs: endpoint.breadcrumbs.map((breadcrumb) => breadcrumb.title),
        slug: endpoint.slug,
        version: endpoint.version,
        indexSegmentId: endpoint.indexSegmentId,
    };
}

export function convertPageV4ToV3(page: Algolia.AlgoliaRecord.PageV4, content: string): Algolia.AlgoliaRecord.PageV3 {
    return {
        type: "page-v3",
        title: page.title,
        content: truncateToBytes(content, 50 * 1000),
        breadcrumbs: page.breadcrumbs.map((breadcrumb) => breadcrumb.title),
        slug: page.slug,
        version: page.version,
        indexSegmentId: page.indexSegmentId,
    };
}
