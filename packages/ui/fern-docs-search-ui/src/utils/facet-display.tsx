import { AvailabilityBadge, HttpMethodBadge } from "@fern-ui/fern-docs-badges";
import { ReactNode } from "react";

export const FACET_NAMES = [
    "product.title",
    "version.title",
    "type",
    "api_type",
    "method",
    "status_code",
    "availability",
] as const;
export type FacetName = (typeof FACET_NAMES)[number];
export type FacetsResponse = Record<FacetName, { value: string; count: number }[]>;

export interface FilterOption {
    facet: FacetName;
    value: string;
    count: number;
}

const FACET_DISPLAY_MAP: Record<string, Record<string, ReactNode>> = {
    method: {
        GET: <HttpMethodBadge method="GET" variant="subtle" />,
        POST: <HttpMethodBadge method="POST" variant="subtle" />,
        PUT: <HttpMethodBadge method="PUT" variant="subtle" />,
        PATCH: <HttpMethodBadge method="PATCH" variant="subtle" />,
        DELETE: <HttpMethodBadge method="DELETE" variant="subtle" />,
    },
    availability: {
        Stable: <AvailabilityBadge availability="Stable" rounded variant="subtle" />,
        GenerallyAvailable: <AvailabilityBadge availability="GenerallyAvailable" rounded variant="subtle" />,
        InDevelopment: <AvailabilityBadge availability="InDevelopment" rounded variant="subtle" />,
        PreRelease: <AvailabilityBadge availability="PreRelease" rounded variant="subtle" />,
        Deprecated: <AvailabilityBadge availability="Deprecated" rounded variant="subtle" />,
        Beta: <AvailabilityBadge availability="Beta" rounded variant="subtle" />,
    },
} as const;

const FACET_SMALL_DISPLAY_MAP: Record<string, Record<string, ReactNode>> = {
    method: {
        GET: <HttpMethodBadge method="GET" size="sm" />,
        POST: <HttpMethodBadge method="POST" size="sm" />,
        PUT: <HttpMethodBadge method="PUT" size="sm" />,
        PATCH: <HttpMethodBadge method="PATCH" size="sm" />,
        DELETE: <HttpMethodBadge method="DELETE" size="sm" />,
    },
    availability: {
        Stable: <AvailabilityBadge availability="Stable" size="sm" />,
        GenerallyAvailable: <AvailabilityBadge availability="GenerallyAvailable" size="sm" />,
        InDevelopment: <AvailabilityBadge availability="InDevelopment" size="sm" />,
        PreRelease: <AvailabilityBadge availability="PreRelease" size="sm" />,
        Deprecated: <AvailabilityBadge availability="Deprecated" size="sm" />,
        Beta: <AvailabilityBadge availability="Beta" size="sm" />,
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
        http: "HTTP",
        webhook: "webhooks",
        websocket: "WebSockets",
    },
    type: {
        markdown: "guides",
        changelog: "changelog",
        "api-reference": "APIs",
    },
    availability: {
        Stable: "stable",
        GenerallyAvailable: "generally available",
        InDevelopment: "in development",
        PreRelease: "pre-release",
        Deprecated: "deprecated",
        Beta: "beta",
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
        http: "HTTP",
        webhook: "Webhooks",
        websocket: "WebSockets",
    },
    type: {
        markdown: "Guides",
        changelog: "Changelog",
        "api-reference": "API Reference",
    },
    availability: {
        Stable: "Stable",
        GenerallyAvailable: "Generally available",
        InDevelopment: "In development",
        PreRelease: "Pre-release",
        Deprecated: "Deprecated",
        Beta: "Beta",
    },
};

export const FACET_DISPLAY_NAME: Record<FacetName, string> = {
    method: "HTTP method",
    api_type: "API type",
    type: "Content type",
    "product.title": "Product",
    "version.title": "Version",
    status_code: "Status code",
    availability: "Availability",
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
