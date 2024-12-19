import { Algolia, ApiDefinition, FernNavigation } from "@fern-api/fdr-sdk";
import { truncateToBytes } from "@fern-api/ui-core-utils";
import { toBreadcrumbs, toDescription } from "./utils";

interface GenerateWebhookRecordsOptions {
    indexSegmentId: Algolia.IndexSegmentId;
    node: FernNavigation.WebhookNode;
    breadcrumb: readonly FernNavigation.BreadcrumbItem[];
    webhook: ApiDefinition.WebhookDefinition;
    version: Algolia.AlgoliaRecordVersionV3 | undefined;
}

export function generateWebhookRecord({
    indexSegmentId,
    node,
    breadcrumb,
    webhook,
    version,
}: GenerateWebhookRecordsOptions): Algolia.AlgoliaRecord.WebhookV4 {
    const description = toDescription([
        webhook.description,
        webhook.payload?.description,
    ]);
    const webhookRecord: Algolia.AlgoliaRecord.WebhookV4 = {
        type: "webhook-v4",
        method: webhook.method,
        endpointPath: webhook.path.map((part) => ({
            type: "literal",
            value: part,
        })),
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

    return webhookRecord;
}

interface GenerateWebhookFieldRecordsOptions {
    webhookRecord: Algolia.AlgoliaRecord.WebhookV4;
    webhook: ApiDefinition.WebhookDefinition;
    types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
}

export function generateWebhookFieldRecords({
    webhookRecord,
    webhook,
    types,
}: GenerateWebhookFieldRecordsOptions): Algolia.AlgoliaRecord.WebhookFieldV1[] {
    const fieldRecords: Algolia.AlgoliaRecord.WebhookFieldV1[] = [];

    function push(items: ApiDefinition.TypeDefinitionTreeItem[]) {
        items.forEach((item) => {
            const breadcrumbs = toBreadcrumbs(webhookRecord, item.path);
            const last = breadcrumbs[breadcrumbs.length - 1];
            if (!last) {
                throw new Error("Breadcrumb should have at least 1");
            }

            fieldRecords.push({
                ...webhookRecord,
                type: "webhook-field-v1",
                title: last.title,
                description: toDescription(item.descriptions),
                breadcrumbs: breadcrumbs.slice(0, breadcrumbs.length - 1),
                slug: FernNavigation.V1.Slug(last.slug),
                availability: item.availability,
                extends: undefined,
            });
        });
    }

    webhook.headers?.forEach((property) => {
        push(
            ApiDefinition.collectTypeDefinitionTreeForObjectProperty(
                property,
                types,
                [
                    { type: "meta", value: "payload", displayName: "Payload" },
                    { type: "meta", value: "header", displayName: "Headers" },
                ]
            )
        );
    });

    if (webhook.payload) {
        push(
            ApiDefinition.collectTypeDefinitionTree(
                webhook.payload.shape,
                types,
                {
                    path: [
                        {
                            type: "meta",
                            value: "payload",
                            displayName: "Payload",
                        },
                        { type: "meta", value: "body", displayName: undefined },
                    ],
                }
            )
        );
    }

    return fieldRecords;
}
