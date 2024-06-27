import { FernNavigation } from "@fern-api/fdr-sdk";
import { SidebarVersionInfo } from "@fern-ui/fdr-utils";
import urljoin from "url-join";
import type { SearchRecord } from "./types";

export function getFullPathForSearchRecord(record: SearchRecord, basePath: string | undefined): string {
    const parts =
        basePath
            ?.split("/")
            .map((part) => part.trim())
            .filter((part) => part.length > 0) ?? [];
    const leadingPath = getLeadingPathForSearchRecord(record);
    if (record.type === "endpoint" || record.type === "page") {
        if (record.versionSlug == null) {
            parts.push(...leadingPath);
        } else {
            parts.push(record.versionSlug, ...leadingPath);
        }
    } else if (record.type === "endpoint-v2" || record.type === "page-v2") {
        if (record.version == null) {
            parts.push(...leadingPath);
        } else {
            // return `${record.version.urlSlug}/${leadingPath}`;
            parts.push(record.version.urlSlug, ...leadingPath);
        }
    } else {
        parts.push(...record.slug.split("/"));
    }
    return urljoin(parts);
}

function getLeadingPathForSearchRecord(record: SearchRecord): string[] {
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
    activeVersion: SidebarVersionInfo | undefined,
    sidebar: FernNavigation.SidebarRootNode | undefined,
): string {
    return `Search ${activeVersion != null ? `across ${activeVersion.id} ` : ""}for ${createSearchPlaceholder(sidebar)}...`;
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
