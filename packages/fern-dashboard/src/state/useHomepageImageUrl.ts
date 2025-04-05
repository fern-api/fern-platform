import { useQuery } from "@tanstack/react-query";

import { FdrAPI } from "@fern-api/fdr-sdk";

import { Theme } from "@/app/api/homepage-images/types";
import { DashboardApiClient } from "@/app/services/dashboard-api/client";
import { convertFdrDocsSiteUrlToDocsUrl } from "@/utils/getDocsSiteUrl";

import { convertQueryResultToLoadable } from "./convertQueryResultToLoadable";
import { ReactQueryKey, inferQueryData } from "./queryKeys";

export function useHomepageImageUrl({
  docsSite,
  theme,
}: {
  docsSite: FdrAPI.dashboard.DocsSite;
  theme: Theme;
}) {
  const docsUrls = docsSite.urls.map(convertFdrDocsSiteUrlToDocsUrl);
  const QUERY_KEY = ReactQueryKey.homepageImageUrl({
    docsUrls,
    theme,
  });

  return convertQueryResultToLoadable(
    useQuery<inferQueryData<typeof QUERY_KEY>>({
      queryKey: QUERY_KEY,
      queryFn: () =>
        DashboardApiClient.getHomepageImages({ urls: docsUrls, theme }),
      retry: false,
    })
  );
}
