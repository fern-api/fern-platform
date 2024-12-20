import { Algolia, ApiDefinition, FernNavigation } from "@fern-api/fdr-sdk";
import { truncateToBytes } from "@fern-api/ui-core-utils";
import { convertNameToAnchorPart, toBreadcrumbs, toDescription } from "./utils";

interface GenerateEndpointRecordsOptions {
  indexSegmentId: Algolia.IndexSegmentId;
  node: FernNavigation.EndpointNode;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  endpoint: ApiDefinition.EndpointDefinition;
  version: Algolia.AlgoliaRecordVersionV3 | undefined;
}

export function generateEndpointRecord({
  indexSegmentId,
  node,
  breadcrumb,
  endpoint,
  version,
}: GenerateEndpointRecordsOptions): Algolia.AlgoliaRecord.EndpointV4 {
  const description = toDescription([
    endpoint.description,
    endpoint.requests?.[0]?.description,
    endpoint.responses?.[0]?.description,
  ]);
  const endpointRecord: Algolia.AlgoliaRecord.EndpointV4 = {
    type: "endpoint-v4",
    method: endpoint.method,
    endpointPath: endpoint.path,
    isResponseStream:
      endpoint.responses?.[0]?.body.type === "stream" ||
      endpoint.responses?.[0]?.body.type === "streamingText",
    title: node.title,
    description: description?.length
      ? truncateToBytes(description, 50 * 1000)
      : undefined,
    breadcrumbs: breadcrumb.map((breadcrumb) => ({
      title: breadcrumb.title,
      slug: breadcrumb.pointsTo ?? "",
    })),
    slug: FernNavigation.V1.Slug(node.canonicalSlug ?? node.slug),
    version,
    indexSegmentId,
  };

  return endpointRecord;
}

interface GenerateEndpointFieldRecordsOptions {
  endpointRecord: Algolia.AlgoliaRecord.EndpointV4;
  endpoint: ApiDefinition.EndpointDefinition;
  types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
}

export function generateEndpointFieldRecords({
  endpointRecord,
  endpoint,
  types,
}: GenerateEndpointFieldRecordsOptions): Algolia.AlgoliaRecord.EndpointFieldV1[] {
  const fieldRecords: Algolia.AlgoliaRecord.EndpointFieldV1[] = [];

  function push(items: ApiDefinition.TypeDefinitionTreeItem[]) {
    items.forEach((item) => {
      const breadcrumbs = toBreadcrumbs(endpointRecord, item.path);
      const last = breadcrumbs[breadcrumbs.length - 1];

      if (!last) {
        throw new Error("Breadcrumb should have at least 1");
      }

      const description = toDescription(item.descriptions);

      fieldRecords.push({
        ...endpointRecord,
        type: "endpoint-field-v1",
        title: last.title,
        description: description?.length
          ? truncateToBytes(description, 50 * 1000)
          : undefined,
        breadcrumbs: breadcrumbs.slice(0, breadcrumbs.length - 1),
        slug: FernNavigation.V1.Slug(last.slug),
        availability: item.availability,
        extends: undefined,
      });
    });
  }

  endpoint.requestHeaders?.forEach((property) => {
    push(
      ApiDefinition.collectTypeDefinitionTreeForObjectProperty(
        property,
        types,
        [
          { type: "meta", value: "request", displayName: "Request" },
          { type: "meta", value: "header", displayName: "Headers" },
        ]
      )
    );
  });

  endpoint.queryParameters?.forEach((property) => {
    push(
      ApiDefinition.collectTypeDefinitionTreeForObjectProperty(
        property,
        types,
        [
          { type: "meta", value: "request", displayName: "Request" },
          { type: "meta", value: "query", displayName: "Query Parameters" },
        ]
      )
    );
  });

  endpoint.pathParameters?.forEach((property) => {
    push(
      ApiDefinition.collectTypeDefinitionTreeForObjectProperty(
        property,
        types,
        [
          { type: "meta", value: "request", displayName: "Request" },
          { type: "meta", value: "path", displayName: "Path Parameters" },
        ]
      )
    );
  });

  if (endpoint.requests?.[0]) {
    switch (endpoint.requests?.[0]?.body.type) {
      case "object":
      case "alias":
        push(
          ApiDefinition.collectTypeDefinitionTree(
            endpoint.requests?.[0]?.body,
            types,
            {
              path: [
                { type: "meta", value: "request", displayName: "Request" },
                { type: "meta", value: "body", displayName: undefined },
              ],
            }
          )
        );
        break;
      case "bytes":
      case "formData":
        // TODO: implement this
        break;
    }
  }

  endpoint.responseHeaders?.forEach((property) => {
    push(
      ApiDefinition.collectTypeDefinitionTreeForObjectProperty(
        property,
        types,
        [
          { type: "meta", value: "response", displayName: "Response" },
          { type: "meta", value: "header", displayName: "Headers" },
        ]
      )
    );
  });

  if (endpoint.responses?.[0]) {
    switch (endpoint.responses?.[0]?.body.type) {
      case "alias":
      case "object":
        push(
          ApiDefinition.collectTypeDefinitionTree(
            endpoint.responses?.[0]?.body,
            types,
            {
              path: [
                { type: "meta", value: "response", displayName: "Response" },
                { type: "meta", value: "body", displayName: undefined },
              ],
            }
          )
        );
        break;
      case "stream":
        push(
          ApiDefinition.collectTypeDefinitionTree(
            endpoint.responses?.[0]?.body.shape,
            types,
            {
              path: [
                { type: "meta", value: "response", displayName: "Response" },
                { type: "meta", value: "body", displayName: undefined },
                { type: "meta", value: "stream", displayName: undefined },
              ],
            }
          )
        );
        break;
      case "fileDownload":
      case "streamingText":
        // TODO: implement this
        break;
    }
  }

  endpoint.errors?.forEach((error) => {
    if (error.shape != null) {
      if (error.description) {
        fieldRecords.push({
          ...endpointRecord,
          type: "endpoint-field-v1",
          title: error.name,
          description: toDescription([error.description]),
          breadcrumbs: toBreadcrumbs(endpointRecord, [
            { type: "meta", value: "response", displayName: "Response" },
            { type: "meta", value: "error", displayName: "Errors" },
          ]),
          slug: FernNavigation.V1.Slug(
            `${endpointRecord.slug}#response.error.${convertNameToAnchorPart(error.name) ?? error.statusCode}`
          ),
          availability: error.availability,
          extends: undefined,
        });
      }

      push(
        ApiDefinition.collectTypeDefinitionTree(error.shape, types, {
          path: [
            { type: "meta", value: "response", displayName: "Response" },
            { type: "meta", value: "error", displayName: "Errors" },
            {
              type: "meta",
              value:
                convertNameToAnchorPart(error.name) ??
                error.statusCode.toString(),
              displayName: error.name,
            },
          ],
        })
      );
    }
  });

  return fieldRecords;
}
