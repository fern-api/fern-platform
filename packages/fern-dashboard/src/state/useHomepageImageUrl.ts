import { useQuery } from "@tanstack/react-query";

import { Theme } from "@/app/api/homepage-images/types";
import { DashboardApiClient } from "@/app/services/dashboard-api/client";
import { DocsUrl } from "@/utils/types";

import { convertQueryResultToLoadable } from "./convertQueryResultToLoadable";
import { ReactQueryKey, inferQueryData } from "./queryKeys";

export function useHomepageImageUrl({
  docsUrl,
  theme,
}: {
  docsUrl: DocsUrl;
  theme: Theme;
}) {
  const QUERY_KEY = ReactQueryKey.homepageImageUrl({ docsUrl, theme });

  return convertQueryResultToLoadable(
    useQuery<inferQueryData<typeof QUERY_KEY>>({
      queryKey: QUERY_KEY,
      queryFn: () =>
        DashboardApiClient.getHomepageImages({ url: docsUrl, theme }),
      retry: false,
    })
  );
}
