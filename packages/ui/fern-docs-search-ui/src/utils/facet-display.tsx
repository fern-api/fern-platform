import { HttpMethodTag } from "@fern-ui/fern-http-method-tag";
import { ReactNode } from "react";

export const FACET_NAMES = ["product.title", "version.title", "type", "api_type", "method", "status_code"] as const;
export type FacetName = (typeof FACET_NAMES)[number];
export type FacetsResponse = Record<FacetName, { value: string; count: number }[]>;

interface FilterOption {
    facet: FacetName;
    value: string;
    count: number;
}

const FACET_DISPLAY_MAP: Record<string, Record<string, ReactNode>> = {
    method: {
        GET: <HttpMethodTag method="GET" />,
        POST: <HttpMethodTag method="POST" />,
        PUT: <HttpMethodTag method="PUT" />,
        PATCH: <HttpMethodTag method="PATCH" />,
        DELETE: <HttpMethodTag method="DELETE" />,
    },
} as const;

const FACET_SMALL_DISPLAY_MAP: Record<string, Record<string, ReactNode>> = {
    method: {
        GET: <HttpMethodTag method="GET" size="sm" />,
        POST: <HttpMethodTag method="POST" size="sm" />,
        PUT: <HttpMethodTag method="PUT" size="sm" />,
        PATCH: <HttpMethodTag method="PATCH" size="sm" />,
        DELETE: <HttpMethodTag method="DELETE" size="sm" />,
    },
} as const;

export const FACET_DISPLAY_NAME_MAP: Record<string, Record<string, string>> = {
    method: {
        GET: "GET requests",
        POST: "POST requests",
        PUT: "PUT requests",
        PATCH: "PATCH requests",
        DELETE: "DELETE requests",
    },
    api_type: {
        http: "rest",
        webhook: "webhooks",
        websocket: "web sockets",
    },
    type: {
        markdown: "guides",
        changelog: "changelog",
        "api-reference": "endpoints",
    },
};
export const FACET_DISPLAY_NAME_TITLE_CASE_MAP: Record<string, Record<string, string>> = {
    method: {
        GET: "GET requests",
        POST: "POST requests",
        PUT: "PUT requests",
        PATCH: "PATCH requests",
        DELETE: "DELETE requests",
    },
    api_type: {
        http: "Rest",
        webhook: "Webhooks",
        websocket: "Web sockets",
    },
    type: {
        markdown: "Guides",
        changelog: "Changelog",
        "api-reference": "Endpoints",
    },
};

export const FACET_DISPLAY_NAME: Record<FacetName, string> = {
    method: "HTTP method",
    api_type: "API type",
    type: "Content type",
    "product.title": "Product",
    "version.title": "Version",
    status_code: "Status code",
};

export function toFilterOptions(facets: FacetsResponse | undefined, query: string): FilterOption[] {
    if (facets == null) {
        return [];
    }

    query = query.trim().toLowerCase();

    const results: FilterOption[] = [];

    FACET_NAMES.forEach((facet) => {
        const values = facets[facet];
        values.forEach(({ value, count }) => {
            if (count === 0) {
                return;
            }

            const displayName = FACET_DISPLAY_NAME_MAP[facet]?.[value];

            if (value.toLowerCase().includes(query) || displayName?.toLowerCase().includes(query)) {
                results.push({ facet, value, count });
            }
        });
    });

    return results;
}

export function toFilterLabel(facet: FacetName): string {
    return FACET_DISPLAY_NAME[facet];
}

export function getFacetDisplay(
    facet: string,
    value: string,
    { small = false, titleCase = false }: { small?: boolean; titleCase?: boolean } = {},
): ReactNode {
    return (
        (small ? FACET_SMALL_DISPLAY_MAP : FACET_DISPLAY_MAP)[facet]?.[value] ??
        (titleCase ? FACET_DISPLAY_NAME_TITLE_CASE_MAP : FACET_DISPLAY_NAME_MAP)[facet]?.[value] ??
        value
    );
}
