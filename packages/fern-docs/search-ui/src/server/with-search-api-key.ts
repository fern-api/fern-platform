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

export function withSearchApiKey({
  searchApiKey,
  domain,
  roles,
  authed,
  userToken,
  /**
   * Defaults to 24 hours
   */
  expiresInSeconds = DEFAULT_SEARCH_API_KEY_EXPIRATION_SECONDS,
}: WithSearchApiKeyOptions): string {
  return getSearchApiKey({
    parentApiKey: searchApiKey,
    domain,
    roles,
    authed,
    expiresInSeconds,
    searchIndex: SEARCH_INDEX,
    userToken,
  });
}
