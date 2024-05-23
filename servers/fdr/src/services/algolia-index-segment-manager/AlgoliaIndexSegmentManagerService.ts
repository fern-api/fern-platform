import { visitDbNavigationConfig } from "@fern-api/fdr-sdk";
import { addHours, addMinutes } from "date-fns";
import { kebabCase } from "lodash-es";
import { v4 as uuidv4 } from "uuid";
import { Cache } from "../../Cache";
import { DocsV1Db } from "../../api";
import type { FdrApplication } from "../../app";
import type { DocsVersion } from "../../types";
import type { ConfigSegmentTuple, IndexSegment } from "../algolia";

const SECONDS_IN_ONE_HOUR = 60 * 60;

type GenerateNewIndexSegmentsResult =
    | {
          type: "versioned";
          configSegmentTuples: ConfigSegmentTuple[];
      }
    | {
          type: "unversioned";
          configSegmentTuple: ConfigSegmentTuple;
      };

export interface AlgoliaIndexSegmentManagerService {
    getOrGenerateSearchApiKeyForIndexSegment(indexSegmentId: string): string;

    getSearchApiKeyForIndexSegment(indexSegmentId: string): string | undefined;

    generateAndCacheApiKey(indexSegmentId: string): string;

    generateIndexSegmentsForDefinition({
        dbDocsDefinition,
        url,
    }: {
        dbDocsDefinition: DocsV1Db.DocsDefinitionDb;
        url: string;
    }): GenerateNewIndexSegmentsResult;
}

export class AlgoliaIndexSegmentManagerServiceImpl implements AlgoliaIndexSegmentManagerService {
    private static config = {
        apiKeyTTLHours: 8,
        /**
         * For example, if set to 30, API keys will stop functioning 30 minutes after they are removed from cache.
         */
        apiKeyTTLExpiryDiffMinutes: 30,
        maxKeysToCache: 5_000,
    };

    private apiKeysCache: Cache<string>;

    private get algolia() {
        return this.app.services.algolia;
    }

    constructor(private readonly app: FdrApplication) {
        this.apiKeysCache = new Cache(AlgoliaIndexSegmentManagerServiceImpl.config.maxKeysToCache, SECONDS_IN_ONE_HOUR);
    }

    public generateIndexSegmentsForDefinition({
        dbDocsDefinition,
        url,
    }: {
        dbDocsDefinition: DocsV1Db.DocsDefinitionDb;
        url: string;
    }): GenerateNewIndexSegmentsResult {
        const navigationConfig = dbDocsDefinition.config.navigation;

        return visitDbNavigationConfig<GenerateNewIndexSegmentsResult>(navigationConfig, {
            versioned: (config) => {
                const configSegmentTuples = config.versions.map((v) => {
                    const indexSegment = this.generateNewIndexSegmentForUnversionedNavigationConfig({
                        url,
                        version: { id: v.version, urlSlug: v.urlSlug },
                    });
                    return [v.config, indexSegment] as const;
                });
                return {
                    type: "versioned",
                    configSegmentTuples,
                };
            },
            unversioned: (config) => {
                const indexSegment = this.generateNewIndexSegmentForUnversionedNavigationConfig({
                    url,
                });
                return {
                    type: "unversioned",
                    configSegmentTuple: [config, indexSegment] as const,
                };
            },
        });
    }

    private generateNewIndexSegmentForUnversionedNavigationConfig({
        version,
        url,
    }: {
        version?: DocsVersion;
        url: string;
    }): IndexSegment {
        const indexSegmentId = this.generateUniqueIdForIndexSegment({ url, version });
        const searchApiKey = this.generateAndCacheApiKey(indexSegmentId);
        return version != null
            ? {
                  type: "versioned",
                  id: indexSegmentId,
                  searchApiKey,
                  version,
              }
            : {
                  type: "unversioned",
                  id: indexSegmentId,
                  searchApiKey,
              };
    }

    private generateUniqueIdForIndexSegment({ version, url }: { version?: DocsVersion; url: string }) {
        const parts: string[] = ["seg", url];
        if (version != null) {
            parts.push(kebabCase(version.id));
        }
        parts.push(uuidv4());
        return parts.join("_");
    }

    public getOrGenerateSearchApiKeyForIndexSegment(indexSegmentId: string) {
        const cachedKey = this.apiKeysCache.get(indexSegmentId);
        if (typeof cachedKey === "string") {
            return cachedKey;
        } else {
            return this.generateAndCacheApiKey(indexSegmentId);
        }
    }

    public getSearchApiKeyForIndexSegment(indexSegmentId: string) {
        const cachedKey = this.apiKeysCache.get(indexSegmentId);
        return cachedKey;
    }

    public generateAndCacheApiKey(indexSegmentId: string) {
        const now = new Date();
        const cacheUntil = addHours(now, AlgoliaIndexSegmentManagerServiceImpl.config.apiKeyTTLHours);
        const validUntil = addMinutes(
            cacheUntil,
            AlgoliaIndexSegmentManagerServiceImpl.config.apiKeyTTLExpiryDiffMinutes,
        );
        const key = this.algolia.generateSearchApiKey(`indexSegmentId:${indexSegmentId}`, validUntil);
        this.tryCacheApiKey(indexSegmentId, key);
        return key;
    }

    private tryCacheApiKey(indexSegmentId: string, apiKey: string) {
        try {
            this.apiKeysCache.set(indexSegmentId, apiKey);
        } catch {
            // Cache is full, ignore error
            return;
        }
    }
}
