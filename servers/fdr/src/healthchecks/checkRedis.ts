import { LOGGER } from "../app/FdrApplication";
import { CachedDocsResponse } from "../services/docs-cache/DocsDefinitionCache";
import RedisDocsDefinitionStore from "../services/docs-cache/RedisDocsDefinitionStore";

const HEALTHCHECK_KEY = "https://healthcheck.buildwithfern.com";
const HEALTHCHECK_DOCS_RESPONSE: CachedDocsResponse = {
    dbFiles: {},
    isPrivate: true,
    response: {
        baseUrl: {
            domain: "healthcheck.buildwithfern.com",
        },
        definition: {
            pages: {},
            apis: {},
            config: {
                navigation: {
                    items: [],
                },
            },
            files: {},
            filesV2: {},
            search: {
                type: "singleAlgoliaIndex",
                value: {
                    type: "unversioned",
                    indexSegment: {
                        id: "healthcheck",
                        searchApiKey: "dummy",
                    },
                },
            },
        },
        lightModeEnabled: true,
    },
    updatedTime: new Date(),
    version: "v2",
};

export async function checkRedis({ redis }: { redis: RedisDocsDefinitionStore }): Promise<boolean> {
    try {
        const healthcheckURL = new URL(HEALTHCHECK_KEY);
        await redis.set({ url: healthcheckURL, value: HEALTHCHECK_DOCS_RESPONSE });
        const record = await redis.get({ url: healthcheckURL });

        if (record?.response.baseUrl.domain !== healthcheckURL.hostname) {
            return false;
        }

        return true;
    } catch (err) {
        LOGGER.error("Encountered error while retrieving and storing redis entries", err);
        return false;
    }
}
