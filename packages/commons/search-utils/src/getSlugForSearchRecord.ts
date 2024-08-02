import { Algolia, FernNavigation } from "@fern-api/fdr-sdk";
import { UnreachableCaseError } from "ts-essentials";

export function getSlugForSearchRecord(record: Algolia.AlgoliaRecord, basePath: string | undefined): string {
    return visitSearchRecord<string>(record)._visit({
        v3: (record) => record.slug,
        v2: (record) =>
            FernNavigation.utils.slugjoin(
                basePath || "/",
                record.version?.urlSlug ?? "",
                ...getLeadingPathForSearchRecord(record),
            ),
        v1: (record) =>
            FernNavigation.utils.slugjoin(
                basePath || "/",
                record.versionSlug ?? "",
                ...getLeadingPathForSearchRecord(record),
            ),
    });
}

export function getTitleForSearchRecord(record: Algolia.AlgoliaRecord): string {
    return visitSearchRecord<string>(record)._visit({
        v3: (record) => record.title,
        v2: (record) =>
            record.type === "endpoint-v2"
                ? record.endpoint.path.parts.map((p) => (p.type === "pathParameter" ? `:${p.value}` : p.value)).join("")
                : record.title,
        v1: (record) => record.title,
    });
}

export function getContentForSearchRecord(record: Algolia.AlgoliaRecord): string | undefined {
    return visitSearchRecord<string | undefined>(record)._visit({
        v3: (record) => record.content ?? undefined,
        v2: (record) => (record.type === "page-v2" ? record.content : undefined),
        v1: () => undefined,
    });
}

function getLeadingPathForSearchRecord(record: Algolia.AlgoliaRecord): string[] {
    switch (record.type) {
        case "page":
        case "endpoint":
            return [record.path];
        case "page-v2":
        case "endpoint-v2":
            return record.path.parts.filter((p) => p.skipUrlSlug !== true).map((p) => p.urlSlug);
        default:
            return [];
    }
}

export function createSearchPlaceholderWithVersion(
    version: string | undefined,
    sidebar: FernNavigation.SidebarRootNode | undefined,
): string {
    return `Search ${version != null ? `across ${version} ` : ""}for ${createSearchPlaceholder(sidebar)}...`;
}

function createSearchPlaceholder(sidebar: FernNavigation.SidebarRootNode | undefined): string {
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
    FernNavigation.utils.traverseNavigation(sidebar, (node) => {
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
    FernNavigation.utils.traverseNavigation(sidebar, (node) => {
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
    v3: (
        record:
            | Algolia.AlgoliaRecord.PageV3
            | Algolia.AlgoliaRecord.EndpointV3
            | Algolia.AlgoliaRecord.WebsocketV3
            | Algolia.AlgoliaRecord.WebhookV3,
    ) => T;
    v2: (record: Algolia.AlgoliaRecord.PageV2 | Algolia.AlgoliaRecord.EndpointV2) => T;
    v1: (record: Algolia.AlgoliaRecord.Page | Algolia.AlgoliaRecord.Endpoint) => T;
}

function visitSearchRecord<T>(record: Algolia.AlgoliaRecord): { _visit: (visitor: SearchRecordVisitor<T>) => T } {
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
                default:
                    throw new UnreachableCaseError(record);
            }
        },
    };
}
