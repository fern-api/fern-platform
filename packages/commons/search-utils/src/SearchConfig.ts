import { Algolia, FdrClient } from "@fern-api/fdr-sdk";
import { assertNonNullish } from "@fern-ui/core-utils";
import type {
    InkeepAIChatSettings,
    InkeepModalSettings,
    InkeepSearchSettings,
    InkeepWidgetBaseSettings,
} from "@inkeep/widgets";
import { getAll } from "@vercel/edge-config";
import type { DeepReadonly } from "ts-essentials";

export const REGISTRY_SERVICE = new FdrClient({
    environment: process.env.NEXT_PUBLIC_FDR_ORIGIN ?? "https://registry.buildwithfern.com",
});

const FEATURE_FLAGS = ["inkeep-enabled" as const];

export type InkeepSharedSettings = DeepReadonly<{
    baseSettings: InkeepWidgetBaseSettings;
    aiChatSettings?: Partial<InkeepAIChatSettings>;
    searchSettings?: Partial<InkeepSearchSettings>;
    modalSettings?: Partial<InkeepModalSettings>;
}>;

interface EdgeConfigResponse {
    "inkeep-enabled"?: Record<string, InkeepSharedSettings>;
}

export declare namespace SearchConfig {
    interface Unversioned {
        type: "unversioned";
        value: string;
    }

    interface Versioned {
        type: "versioned";
        // keyed by version id
        values: Record<string, string>;
    }

    interface Inkeep extends InkeepSharedSettings {
        isAvailable: true;
        type: "inkeep";
    }

    interface Algolia {
        isAvailable: true;
        type: "algolia";
        appId: string;
        searchApiKey: Unversioned | Versioned;
        index: string;
    }

    interface Unavailable {
        isAvailable: false;
    }
}

export type SearchConfig = SearchConfig.Inkeep | SearchConfig.Algolia | SearchConfig.Unavailable;

export interface SearchRequest {
    searchInfo: Algolia.SearchInfo | undefined;
}

export async function getSearchConfig(domain: string, { searchInfo }: SearchRequest): Promise<SearchConfig> {
    try {
        const config = await getAll<EdgeConfigResponse>(FEATURE_FLAGS);
        const maybeInkeep = config["inkeep-enabled"]?.[domain];

        if (maybeInkeep?.baseSettings.integrationId != null) {
            return {
                isAvailable: true,
                type: "inkeep",
                ...maybeInkeep,
            };
        }
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Error fetching edge config", e);
    }

    if (typeof searchInfo !== "object" || searchInfo.type === "legacyMultiAlgoliaIndex") {
        return { isAvailable: false };
    }

    const algoliaAppId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
    const algoliaSearchIndex = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_INDEX;

    assertNonNullish(algoliaAppId, "Missing environment variable: NEXT_PUBLIC_ALGOLIA_APP_ID");
    assertNonNullish(algoliaSearchIndex, "Missing environment variable: NEXT_PUBLIC_ALGOLIA_SEARCH_INDEX");

    if (searchInfo.value.type === "unversioned") {
        const resp = await REGISTRY_SERVICE.docs.v2.read.getSearchApiKeyForIndexSegment({
            indexSegmentId: searchInfo.value.indexSegment.id,
        });

        if (!resp.ok) {
            return { isAvailable: false };
        }

        return {
            isAvailable: true,
            type: "algolia",
            appId: algoliaAppId,
            searchApiKey: {
                type: "unversioned",
                value: resp.body.searchApiKey,
            },
            index: algoliaSearchIndex,
        };
    } else if (searchInfo.value.type === "versioned") {
        const values: Record<string, string> = {};

        for (const [versionId, indexSegment] of Object.entries(searchInfo.value.indexSegmentsByVersionId)) {
            const resp = await REGISTRY_SERVICE.docs.v2.read.getSearchApiKeyForIndexSegment({
                indexSegmentId: indexSegment.id,
            });

            if (!resp.ok) {
                return { isAvailable: false };
            }

            values[versionId] = resp.body.searchApiKey;
        }

        if (Object.keys(values).length === 0) {
            return { isAvailable: false };
        }

        return {
            isAvailable: true,
            type: "algolia",
            appId: algoliaAppId,
            searchApiKey: {
                type: "versioned",
                values,
            },
            index: algoliaSearchIndex,
        };
    }

    return { isAvailable: false };
}
