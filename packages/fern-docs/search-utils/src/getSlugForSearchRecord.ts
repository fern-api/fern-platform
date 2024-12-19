import type { Algolia } from "@fern-api/fdr-sdk/client/types";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { UnreachableCaseError } from "ts-essentials";

export function getSlugForSearchRecord(
    record: Algolia.AlgoliaRecord,
    basePath: string | undefined
): string {
    return visitSearchRecord<string>(record)._visit({
        v4: (record) => record.slug,
        v3: (record) => record.slug,
        v2: (record) =>
            FernNavigation.slugjoin(
                basePath || "/",
                record.version?.urlSlug ?? "",
                ...getLeadingPathForSearchRecord(record)
            ),
        v1: (record) =>
            FernNavigation.slugjoin(
                basePath || "/",
                record.versionSlug ?? "",
                ...getLeadingPathForSearchRecord(record)
            ),
    });
}

export function getTitleForSearchRecord(record: Algolia.AlgoliaRecord): string {
    return visitSearchRecord<string>(record)._visit({
        v4: (record) => record.title,
        v3: (record) => record.title,
        v2: (record) =>
            record.type === "endpoint-v2"
                ? record.endpoint.path.parts
                      .map((p) =>
                          p.type === "pathParameter" ? `:${p.value}` : p.value
                      )
                      .join("")
                : record.title,
        v1: (record) => record.title,
    });
}

export function getContentForSearchRecord(
    record: Algolia.AlgoliaRecord
): string | undefined {
    return visitSearchRecord<string | undefined>(record)._visit({
        v4: (record) => {
            switch (record.type) {
                case "page-v4":
                case "endpoint-v4":
                case "websocket-v4":
                case "webhook-v4":
                case "endpoint-field-v1":
                case "websocket-field-v1":
                case "webhook-field-v1":
                    return record.description;
                case "markdown-section-v1":
                    return record.content;
            }
        },
        v3: (record) => record.content ?? undefined,
        v2: (record) =>
            record.type === "page-v2" ? record.content : undefined,
        v1: () => undefined,
    });
}

function getLeadingPathForSearchRecord(
    record: Algolia.AlgoliaRecord
): string[] {
    switch (record.type) {
        case "page":
        case "endpoint":
            return [record.path];
        case "page-v2":
        case "endpoint-v2":
            return record.path.parts
                .filter((p) => p.skipUrlSlug !== true)
                .map((p) => p.urlSlug);
        default:
            return [];
    }
}

export function createSearchPlaceholderWithVersion(
    version: string | undefined,
    sidebar: FernNavigation.SidebarRootNode | undefined
): string {
    return `Search ${version != null ? `across ${version} ` : ""}for ${createSearchPlaceholder(sidebar)}...`;
}

function createSearchPlaceholder(
    sidebar: FernNavigation.SidebarRootNode | undefined
): string {
    if (sidebar == null) {
        return "guides and endpoints";
    }
    const hasGuides = checkHasGuides(sidebar);
    const hasEndpoints = checkHasEndpoints(sidebar);
    if (hasGuides && hasEndpoints) {
        return "guides and endpoints";
    }

    if (hasGuides) {
        return "guides";
    }

    if (hasEndpoints) {
        return "endpoints";
    }

    return "guides and endpoints";
}

function checkHasGuides(sidebar: FernNavigation.SidebarRootNode): boolean {
    let hasGuides = false;
    FernNavigation.traverseBF(sidebar, (node) => {
        if (node.type === "page") {
            hasGuides = true;
            return false;
        }
        if (node.type === "changelog") {
            return "skip";
        }
        return;
    });
    return hasGuides;
}

function checkHasEndpoints(sidebar: FernNavigation.SidebarRootNode): boolean {
    let hasEndpoints = false;
    FernNavigation.traverseBF(sidebar, (node) => {
        if (node.type === "apiReference") {
            hasEndpoints = true;
            return false;
        }
        if (node.type === "changelog") {
            return "skip";
        }
        return;
    });
    return hasEndpoints;
}

interface SearchRecordVisitor<T> {
    v4: (
        record:
            | Algolia.AlgoliaRecord.PageV4
            | Algolia.AlgoliaRecord.EndpointV4
            | Algolia.AlgoliaRecord.WebsocketV4
            | Algolia.AlgoliaRecord.WebhookV4
            | Algolia.AlgoliaRecord.EndpointFieldV1
            | Algolia.AlgoliaRecord.WebsocketFieldV1
            | Algolia.AlgoliaRecord.WebhookFieldV1
            | Algolia.AlgoliaRecord.MarkdownSectionV1
    ) => T;
    v3: (
        record:
            | Algolia.AlgoliaRecord.PageV3
            | Algolia.AlgoliaRecord.EndpointV3
            | Algolia.AlgoliaRecord.WebsocketV3
            | Algolia.AlgoliaRecord.WebhookV3
    ) => T;
    v2: (
        record: Algolia.AlgoliaRecord.PageV2 | Algolia.AlgoliaRecord.EndpointV2
    ) => T;
    v1: (
        record: Algolia.AlgoliaRecord.Page | Algolia.AlgoliaRecord.Endpoint
    ) => T;
}

function visitSearchRecord<T>(record: Algolia.AlgoliaRecord): {
    _visit: (visitor: SearchRecordVisitor<T>) => T;
} {
    return {
        _visit: (visitor: SearchRecordVisitor<T>) => {
            switch (record.type) {
                case "page":
                case "endpoint":
                    return visitor.v1(record);
                case "page-v2":
                case "endpoint-v2":
                    return visitor.v2(record);
                case "page-v3":
                case "endpoint-v3":
                case "websocket-v3":
                case "webhook-v3":
                    return visitor.v3(record);
                case "page-v4":
                case "endpoint-v4":
                case "websocket-v4":
                case "webhook-v4":
                case "endpoint-field-v1":
                case "webhook-field-v1":
                case "websocket-field-v1":
                case "markdown-section-v1":
                    return visitor.v4(record);
                default:
                    throw new UnreachableCaseError(record);
            }
        },
    };
}
