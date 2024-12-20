import type { GenerateSecuredApiKeyOptions } from "algoliasearch";
import { createSearchFilters } from "../create-search-filters";
import { generateHmacAndEncode } from "./hmac";

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
  userToken: string | undefined;
}

export async function getSearchApiKey({
  parentApiKey,
  domain,
  roles,
  authed,
  expiresInSeconds,
  searchIndex,
  userToken,
}: GetSearchApiKeyOptions): Promise<string> {
  return await generateSecuredApiKey({
    parentApiKey,
    restrictions: {
      filters:
        createSearchFilters({ domain, roles, authed }) +
        " AND NOT type:navigation",
      validUntil: Math.floor(Date.now() / 1_000) + expiresInSeconds,
      restrictIndices: [searchIndex],
      userToken,
    },
  });
}

async function generateSecuredApiKey({
  parentApiKey,
  restrictions = {},
}: GenerateSecuredApiKeyOptions): Promise<string> {
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
    .reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = (mergedRestrictions as any)[key];
      return acc;
    }, {});

  const queryParameters = serializeQueryParameters(mergedRestrictions);
  return await generateHmacAndEncode(parentApiKey, queryParameters);
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
            : parameters[key]
        ).replace(/\+/g, "%20")}`
    )
    .join("&");
}
