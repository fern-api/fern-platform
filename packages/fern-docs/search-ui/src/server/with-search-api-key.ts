import {
  DEFAULT_SEARCH_API_KEY_EXPIRATION_SECONDS,
  SEARCH_INDEX,
  getSearchApiKey,
} from "@fern-docs/search-server/algolia";

interface WithSearchApiKeyOptions {
  searchApiKey: string;
  domain: string;
  roles: string[];
  authed: boolean;
  userToken: string;
  expiresInSeconds?: number;
}

export async function withSearchApiKey({
  searchApiKey,
  domain,
  roles,
  authed,
  userToken,
  /**
   * Defaults to 24 hours
   */
  expiresInSeconds = DEFAULT_SEARCH_API_KEY_EXPIRATION_SECONDS,
}: WithSearchApiKeyOptions): Promise<string> {
  return await getSearchApiKey({
    parentApiKey: searchApiKey,
    domain,
    roles,
    authed,
    expiresInSeconds,
    searchIndex: SEARCH_INDEX,
    userToken,
  });
}
