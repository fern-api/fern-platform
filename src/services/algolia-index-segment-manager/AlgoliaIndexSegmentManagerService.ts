import { addHours, addMinutes } from "date-fns";
import NodeCache from "node-cache";
import { v4 as uuidv4 } from "uuid";
import { DocsV1Db } from "../../api";
import type { FdrApplication } from "../../app";
import type { DocsVersion } from "../../types";
import { isVersionedNavigationConfig } from "../../util/fern/db";
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

    generateIndexSegmentsForDefinition({
        dbDocsDefinition,
        fernDomain,
    }: {
        dbDocsDefinition: DocsV1Db.DocsDefinitionDb;
        fernDomain: string;
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

    private apiKeysCache: NodeCache;

    private get algolia() {
        return this.app.services.algolia;
    }

    constructor(private readonly app: FdrApplication) {
        this.apiKeysCache = new NodeCache({
            stdTTL: AlgoliaIndexSegmentManagerServiceImpl.config.apiKeyTTLHours * SECONDS_IN_ONE_HOUR,
            maxKeys: AlgoliaIndexSegmentManagerServiceImpl.config.maxKeysToCache,
        });
    }

    public generateIndexSegmentsForDefinition({
        dbDocsDefinition,
        fernDomain,
    }: {
        dbDocsDefinition: DocsV1Db.DocsDefinitionDb;
        fernDomain: string;
    }): GenerateNewIndexSegmentsResult {
        const navigationConfig = dbDocsDefinition.config.navigation;

        if (isVersionedNavigationConfig(navigationConfig)) {
            const configSegmentTuples = navigationConfig.versions.map((v) => {
                const indexSegment = this.generateNewIndexSegmentForUnversionedNavigationConfig({
                    fernDomain,
                    version: { id: v.version, urlSlug: v.urlSlug },
                });
                return [v.config, indexSegment] as const;
            });
            return {
                type: "versioned",
                configSegmentTuples,
            };
        } else {
            const indexSegment = this.generateNewIndexSegmentForUnversionedNavigationConfig({
                fernDomain,
            });
            return {
                type: "unversioned",
                configSegmentTuple: [navigationConfig, indexSegment] as const,
            };
        }
    }

    private generateNewIndexSegmentForUnversionedNavigationConfig({
        version,
        fernDomain,
    }: {
        version?: DocsVersion;
        fernDomain: string;
    }): IndexSegment {
        const indexSegmentId = this.generateUniqueIdForIndexSegment({ fernDomain, version });
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

    private generateUniqueIdForIndexSegment({ version, fernDomain }: { version?: DocsVersion; fernDomain: string }) {
        const parts: string[] = ["seg", fernDomain];
        if (version != null) {
            parts.push(version.id);
        }
        parts.push(uuidv4());
        return parts.join("_");
    }

    public getOrGenerateSearchApiKeyForIndexSegment(indexSegmentId: string) {
        const cachedKey = this.apiKeysCache.get<string>(indexSegmentId);
        if (typeof cachedKey === "string") {
            return cachedKey;
        } else {
            return this.generateAndCacheApiKey(indexSegmentId);
        }
    }

    private generateAndCacheApiKey(indexSegmentId: string) {
        const now = new Date();
        const cacheUntil = addHours(now, AlgoliaIndexSegmentManagerServiceImpl.config.apiKeyTTLHours);
        const validUntil = addMinutes(
            cacheUntil,
            AlgoliaIndexSegmentManagerServiceImpl.config.apiKeyTTLExpiryDiffMinutes
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
