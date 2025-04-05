import { useQuery } from "@tanstack/react-query";

import { DashboardApiClient } from "@/app/services/dashboard-api/client";
import { DocsUrl } from "@/utils/types";

import { convertQueryResultToLoadable } from "./convertQueryResultToLoadable";
import { ReactQueryKey, inferQueryData } from "./queryKeys";

export function useDocsUrlOwner(docsUrl: DocsUrl) {
  const QUERY_KEY = ReactQueryKey.docsUrlOwner(docsUrl);

  return convertQueryResultToLoadable(
    useQuery<inferQueryData<typeof QUERY_KEY>>({
      queryKey: QUERY_KEY,
      queryFn: () => DashboardApiClient.getDocsUrlOwner({ url: docsUrl }),
    })
  );
}
