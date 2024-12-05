import { GenerateSecuredApiKeyOptions } from "algoliasearch";
import { createHmac } from "crypto";
import { createSearchFilters } from "./roles/create-search-filters";

interface GetSearchApiKeyOptions {
    /**
     * Parent READ-only API key scoped to the search index.
     */
    parentApiKey: string;

    /**
     * This should be "fern_docs_search"
     */
    searchIndex: string;

    /**
     * Domain of the docs instance, (i.e. buildwithfern.com, docs.cohere.com, etc.)
     */
    domain: string;

    /**
     * Roles of the user
     */
    roles: string[];

    /**
     * Whether the user is authed or anonymous
     */
    authed: boolean;

    /**
     * Number of seconds from now until the key expires
     */
    expiresInSeconds: number;

    /**
     * User token
     */
    userToken: string;
}

export function getSearchApiKey({
    parentApiKey,
    domain,
    roles,
    authed,
    expiresInSeconds,
    searchIndex,
    userToken,
}: GetSearchApiKeyOptions): string {
    return generateSecuredApiKey({
        parentApiKey,
        restrictions: {
            filters: createSearchFilters({ domain, roles, authed }) + " AND NOT type:navigation",
            validUntil: Math.floor(Date.now() / 1_000) + expiresInSeconds,
            restrictIndices: [searchIndex],
            userToken,
        },
    });
}

function generateSecuredApiKey({ parentApiKey, restrictions = {} }: GenerateSecuredApiKeyOptions): string {
    let mergedRestrictions = restrictions;
    if (restrictions.searchParams) {
        // merge searchParams with the root restrictions
        mergedRestrictions = {
            ...restrictions,
            ...restrictions.searchParams,
        };

        delete mergedRestrictions.searchParams;
    }

    mergedRestrictions = Object.keys(mergedRestrictions)
        .sort()
        .reduce(
            (acc, key) => {
                acc[key] = (mergedRestrictions as any)[key];
                return acc;
            },
            {} as Record<string, unknown>,
        );

    const queryParameters = serializeQueryParameters(mergedRestrictions);
    return Buffer.from(
        createHmac("sha256", parentApiKey).update(queryParameters).digest("hex") + queryParameters,
    ).toString("base64");
}

function serializeQueryParameters(parameters: Record<string, any>): string {
    return Object.keys(parameters)
        .filter((key) => parameters[key] !== undefined)
        .sort()
        .map(
            (key) =>
                `${key}=${encodeURIComponent(
                    Object.prototype.toString.call(parameters[key]) === "[object Array]"
                        ? parameters[key].join(",")
                        : parameters[key],
                ).replace(/\+/g, "%20")}`,
        )
        .join("&");
}
