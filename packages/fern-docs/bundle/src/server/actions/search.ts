"use server";

import { algoliasearch } from "algoliasearch";

import { getAuthEdgeConfig } from "@fern-docs/edge-config";
import {
  DEFAULT_SEARCH_API_KEY_EXPIRATION_SECONDS,
  SEARCH_INDEX,
  fetchFacetValues,
  getSearchApiKey,
} from "@fern-docs/search-server/algolia";
import { withoutStaging } from "@fern-docs/utils";

import { getFernToken } from "@/app/fern-token";

import { safeVerifyFernJWTConfig } from "../auth/FernJWT";
import { algoliaAppId, algoliaSearchApikey } from "../env-variables";
import { getDocsDomainApp } from "../xfernhost/app";

export async function getSearchKeyAction(userToken?: string) {
  const domain = await getDocsDomainApp();
  const fern_token = await getFernToken();
  const user = await safeVerifyFernJWTConfig(
    fern_token,
    await getAuthEdgeConfig(domain)
  );

  const apiKey = await getSearchApiKey({
    parentApiKey: algoliaSearchApikey(),
    domain: withoutStaging(domain),
    roles: user?.roles ?? [],
    authed: user != null,
    expiresInSeconds: DEFAULT_SEARCH_API_KEY_EXPIRATION_SECONDS,
    searchIndex: SEARCH_INDEX,
    userToken,
  });

  return {
    appId: algoliaAppId(),
    apiKey,
  };
}

export async function fetchFacetValuesAction(
  apiKey: string,
  filters: readonly string[]
) {
  return await fetchFacetValues({
    filters: filters,
    client: algoliasearch(algoliaAppId(), apiKey),
  });
}
