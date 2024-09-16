import type { FdrClient } from "@fern-api/fdr-sdk";
import type { Algolia } from "@fern-api/fdr-sdk/client/types";
import { assertNonNullish } from "@fern-platform/core-utils";
import type {
    InkeepAIChatSettings,
    InkeepModalSettings,
    InkeepSearchSettings,
    InkeepWidgetBaseSettings,
} from "@inkeep/widgets";
import { getAll } from "@vercel/edge-config";
import type { DeepReadonly } from "ts-essentials";

const FEATURE_FLAGS = ["inkeep-enabled" as const];

export type InkeepSharedSettings = DeepReadonly<{
    replaceSearch: boolean;
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
        replaceSearch: boolean;
    }

    interface Algolia {
        appId: string;
        searchApiKey: Unversioned | Versioned;
        index: string;
    }

    interface Available {
        isAvailable: true;
        inkeep?: Inkeep;
        algolia: Algolia;
    }

    interface Unavailable {
        isAvailable: false;
    }
}

export type SearchConfig = SearchConfig.Available | SearchConfig.Unavailable;

export interface SearchRequest {
    searchInfo: Algolia.SearchInfo | undefined;
}

async function getAlgoliaSearchConfig(
    client: FdrClient,
    searchInfo: Algolia.SearchInfo,
): Promise<SearchConfig.Algolia | undefined> {
    if (searchInfo.type === "legacyMultiAlgoliaIndex") {
        return undefined;
    }

    const algoliaAppId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
    const algoliaSearchIndex = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_INDEX;

    assertNonNullish(algoliaAppId, "Missing environment variable: NEXT_PUBLIC_ALGOLIA_APP_ID");
    assertNonNullish(algoliaSearchIndex, "Missing environment variable: NEXT_PUBLIC_ALGOLIA_SEARCH_INDEX");

    if (searchInfo.value.type === "unversioned") {
        const resp = await client.docs.v2.read.getSearchApiKeyForIndexSegment({
            indexSegmentId: searchInfo.value.indexSegment.id,
        });

        if (!resp.ok) {
            return undefined;
        }

        return {
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
            const resp = await client.docs.v2.read.getSearchApiKeyForIndexSegment({
                indexSegmentId: indexSegment.id,
            });

            if (!resp.ok) {
                return undefined;
            }

            values[versionId] = resp.body.searchApiKey;
        }

        if (Object.keys(values).length === 0) {
            return undefined;
        }

        return {
            appId: algoliaAppId,
            searchApiKey: {
                type: "versioned",
                values,
            },
            index: algoliaSearchIndex,
        };
    }

    return undefined;
}

export async function getSearchConfig(
    client: FdrClient,
    domain: string,
    searchInfo: Algolia.SearchInfo,
): Promise<SearchConfig> {
    const algolia = await getAlgoliaSearchConfig(client, searchInfo);

    // TODO: there shouldn't be a dependency on algolia being available, if inkeep is enabled.
    if (algolia == null) {
        return { isAvailable: false };
    }

    try {
        const config = await getAll<EdgeConfigResponse>(FEATURE_FLAGS);
        const maybeInkeep = config["inkeep-enabled"]?.[domain];

        if (maybeInkeep?.baseSettings.integrationId != null) {
            return {
                isAvailable: true,
                algolia,
                inkeep: maybeInkeep,
            };
        }
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Error fetching edge config", e);
    }

    return { isAvailable: true, algolia };
}
