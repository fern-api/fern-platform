import {
    AvailabilityBadge,
    HttpMethodBadge,
} from "@fern-docs/components/badges";
import type { FacetsResponse } from "@fern-docs/search-server/algolia";
import {
    SEARCHABLE_FACET_ATTRIBUTES,
    type FacetName,
} from "@fern-docs/search-server/algolia/types";
import { ReactNode } from "react";

import { FilterOption } from "../types";

const FACET_DISPLAY_MAP: Record<string, Record<string, ReactNode>> = {
    method: {
        GET: <HttpMethodBadge method="GET" variant="subtle" />,
        POST: <HttpMethodBadge method="POST" variant="subtle" />,
        PUT: <HttpMethodBadge method="PUT" variant="subtle" />,
        PATCH: <HttpMethodBadge method="PATCH" variant="subtle" />,
        DELETE: <HttpMethodBadge method="DELETE" variant="subtle" />,
        HEAD: <HttpMethodBadge method="HEAD" variant="subtle" />,
        OPTIONS: <HttpMethodBadge method="OPTIONS" variant="subtle" />,
        CONNECT: <HttpMethodBadge method="CONNECT" variant="subtle" />,
        TRACE: <HttpMethodBadge method="TRACE" variant="subtle" />,
    },
    availability: {
        Stable: (
            <AvailabilityBadge availability="Stable" rounded variant="subtle" />
        ),
        GenerallyAvailable: (
            <AvailabilityBadge
                availability="GenerallyAvailable"
                rounded
                variant="subtle"
            />
        ),
        ReleaseCandidate: (
            <AvailabilityBadge
                availability="ReleaseCandidate"
                rounded
                variant="subtle"
            />
        ),
        PublicBeta: (
            <AvailabilityBadge
                availability="PublicBeta"
                rounded
                variant="subtle"
            />
        ),
        Beta: (
            <AvailabilityBadge availability="Beta" rounded variant="subtle" />
        ),
        PrivateBeta: (
            <AvailabilityBadge
                availability="PrivateBeta"
                rounded
                variant="subtle"
            />
        ),
        LimitedAvailability: (
            <AvailabilityBadge
                availability="LimitedAvailability"
                rounded
                variant="subtle"
            />
        ),
        CanaryRelease: (
            <AvailabilityBadge
                availability="CanaryRelease"
                rounded
                variant="subtle"
            />
        ),
        Preview: (
            <AvailabilityBadge
                availability="Preview"
                rounded
                variant="subtle"
            />
        ),
        PreRelease: (
            <AvailabilityBadge
                availability="PreRelease"
                rounded
                variant="subtle"
            />
        ),
        Alpha: (
            <AvailabilityBadge availability="Alpha" rounded variant="subtle" />
        ),
        Experimental: (
            <AvailabilityBadge
                availability="Experimental"
                rounded
                variant="subtle"
            />
        ),
        Internal: (
            <AvailabilityBadge
                availability="Internal"
                rounded
                variant="subtle"
            />
        ),
        InDevelopment: (
            <AvailabilityBadge
                availability="InDevelopment"
                rounded
                variant="subtle"
            />
        ),
        Sunset: (
            <AvailabilityBadge availability="Sunset" rounded variant="subtle" />
        ),
        Deprecated: (
            <AvailabilityBadge
                availability="Deprecated"
                rounded
                variant="subtle"
            />
        ),
        Retired: (
            <AvailabilityBadge
                availability="Retired"
                rounded
                variant="subtle"
            />
        ),
    },
} as const;

const FACET_SMALL_DISPLAY_MAP: Record<string, Record<string, ReactNode>> = {
    method: {
        GET: <HttpMethodBadge method="GET" size="sm" variant="outlined" />,
        POST: <HttpMethodBadge method="POST" size="sm" variant="outlined" />,
        PUT: <HttpMethodBadge method="PUT" size="sm" variant="outlined" />,
        PATCH: <HttpMethodBadge method="PATCH" size="sm" variant="outlined" />,
        DELETE: (
            <HttpMethodBadge method="DELETE" size="sm" variant="outlined" />
        ),
        HEAD: <HttpMethodBadge method="HEAD" size="sm" variant="outlined" />,
        OPTIONS: (
            <HttpMethodBadge method="OPTIONS" size="sm" variant="outlined" />
        ),
        CONNECT: (
            <HttpMethodBadge method="CONNECT" size="sm" variant="outlined" />
        ),
        TRACE: <HttpMethodBadge method="TRACE" size="sm" variant="outlined" />,
    },
    availability: {
        Stable: (
            <AvailabilityBadge
                availability="Stable"
                size="sm"
                variant="outlined"
            />
        ),
        GenerallyAvailable: (
            <AvailabilityBadge
                availability="GenerallyAvailable"
                size="sm"
                variant="outlined"
            />
        ),
        ReleaseCandidate: (
            <AvailabilityBadge
                availability="ReleaseCandidate"
                size="sm"
                variant="outlined"
            />
        ),
        PublicBeta: (
            <AvailabilityBadge
                availability="PublicBeta"
                size="sm"
                variant="outlined"
            />
        ),
        Beta: (
            <AvailabilityBadge
                availability="Beta"
                size="sm"
                variant="outlined"
            />
        ),
        PrivateBeta: (
            <AvailabilityBadge
                availability="PrivateBeta"
                size="sm"
                variant="outlined"
            />
        ),
        LimitedAvailability: (
            <AvailabilityBadge
                availability="LimitedAvailability"
                size="sm"
                variant="outlined"
            />
        ),
        CanaryRelease: (
            <AvailabilityBadge
                availability="CanaryRelease"
                size="sm"
                variant="outlined"
            />
        ),
        Preview: (
            <AvailabilityBadge
                availability="Preview"
                size="sm"
                variant="outlined"
            />
        ),
        PreRelease: (
            <AvailabilityBadge
                availability="PreRelease"
                size="sm"
                variant="outlined"
            />
        ),
        Alpha: (
            <AvailabilityBadge
                availability="Alpha"
                size="sm"
                variant="outlined"
            />
        ),
        Experimental: (
            <AvailabilityBadge
                availability="Experimental"
                size="sm"
                variant="outlined"
            />
        ),
        Internal: (
            <AvailabilityBadge
                availability="Internal"
                size="sm"
                variant="outlined"
            />
        ),
        InDevelopment: (
            <AvailabilityBadge
                availability="InDevelopment"
                size="sm"
                variant="outlined"
            />
        ),
        Sunset: (
            <AvailabilityBadge
                availability="Sunset"
                size="sm"
                variant="outlined"
            />
        ),
        Deprecated: (
            <AvailabilityBadge
                availability="Deprecated"
                size="sm"
                variant="outlined"
            />
        ),
        Retired: (
            <AvailabilityBadge
                availability="Retired"
                size="sm"
                variant="outlined"
            />
        ),
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
        "api-reference": "API endpoints",
    },
    availability: {
        Stable: "stable",
        GenerallyAvailable: "generally available",
        ReleaseCandidate: "release candidate",
        PublicBeta: "public beta",
        Beta: "beta",
        PrivateBeta: "private beta",
        LimitedAvailability: "limited availability",
        CanaryRelease: "canary release",
        Preview: "preview",
        PreRelease: "pre-release",
        Alpha: "alpha",
        Experimental: "experimental",
        Internal: "internal",
        InDevelopment: "in development",
        Sunset: "sunset",
        Deprecated: "deprecated",
        Retired: "retired",
    },
};
export const FACET_DISPLAY_NAME_TITLE_CASE_MAP: Record<
    string,
    Record<string, string>
> = {
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
        ReleaseCandidate: "Release candidate",
        PublicBeta: "Public beta",
        Beta: "Beta",
        PrivateBeta: "Private beta",
        LimitedAvailability: "Limited availability",
        CanaryRelease: "Canary release",
        Preview: "Preview",
        PreRelease: "Pre-release",
        Alpha: "Alpha",
        Experimental: "Experimental",
        Internal: "Internal",
        InDevelopment: "In development",
        Sunset: "Sunset",
        Deprecated: "Deprecated",
        Retired: "Retired",
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

export function toFilterOptions(
    facets: FacetsResponse | undefined
): FilterOption[] {
    if (facets == null) {
        return [];
    }

    const results: FilterOption[] = [];

    SEARCHABLE_FACET_ATTRIBUTES.forEach((facet) => {
        const values = facets[facet];
        values?.forEach(({ value, count }) => {
            if (count === 0) {
                return;
            }

            results.push({ facet, value, count });
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
    {
        small = false,
        titleCase = false,
    }: { small?: boolean; titleCase?: boolean } = {}
): ReactNode {
    return (
        (small ? FACET_SMALL_DISPLAY_MAP : FACET_DISPLAY_MAP)[facet]?.[value] ??
        (titleCase
            ? FACET_DISPLAY_NAME_TITLE_CASE_MAP
            : FACET_DISPLAY_NAME_MAP)[facet]?.[value] ??
        value
    );
}
