import { Algolia, ApiDefinition, FernNavigation } from "@fern-api/fdr-sdk";
import { GenerateAlgoliaRecordsFlags } from "./types";
import { toBreadcrumbs, toDescription } from "./utils";

export function generateWebhookRecords(
    indexSegmentId: Algolia.IndexSegmentId,
    node: FernNavigation.WebhookNode,
    breadcrumb: readonly FernNavigation.BreadcrumbItem[],
    apiDefinition: ApiDefinition.ApiDefinition,
    version: Algolia.AlgoliaRecordVersionV3 | undefined,
    { isFieldRecordsEnabled }: GenerateAlgoliaRecordsFlags,
): (Algolia.AlgoliaRecord.WebhookV4 | Algolia.AlgoliaRecord.WebhookFieldV1)[] {
    const webhook = apiDefinition.webhooks[node.webhookId];

    if (webhook == null) {
        // eslint-disable-next-line no-console
        console.error(`Webhook node ${node.slug} has no webhook ${node.webhookId}`);
        return [];
    }

    const webhookRecord: Algolia.AlgoliaRecord.WebhookV4 = {
        type: "webhook-v4",
        method: webhook.method,
        endpointPath: webhook.path.map((part) => ({ type: "literal", value: part })),
        title: node.title,
        description: toDescription([webhook.description, webhook.payload?.description]),
        breadcrumbs: breadcrumb.map((breadcrumb) => ({
            title: breadcrumb.title,
            slug: breadcrumb.pointsTo ?? "",
        })),
        slug: FernNavigation.V1.Slug(node.canonicalSlug ?? node.slug),
        version,
        indexSegmentId,
    };

    if (!isFieldRecordsEnabled) {
        return [webhookRecord];
    }

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
            ApiDefinition.collectTypeDefinitionTreeForObjectProperty(property, apiDefinition.types, [
                { type: "meta", value: "payload", displayName: "Payload" },
                { type: "meta", value: "header", displayName: "Headers" },
            ]),
        );
    });

    if (webhook.payload) {
        push(
            ApiDefinition.collectTypeDefinitionTree(webhook.payload.shape, apiDefinition.types, {
                path: [
                    { type: "meta", value: "payload", displayName: "Payload" },
                    { type: "meta", value: "body", displayName: undefined },
                ],
            }),
        );
    }

    return [webhookRecord, ...fieldRecords];
}
