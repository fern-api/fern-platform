"use client";

import { useQuery } from "@tanstack/react-query";

import { DashboardApiClient } from "@/app/services/dashboard-api/client";

import { convertQueryResultToLoadable } from "./convertQueryResultToLoadable";
import { ReactQueryKey } from "./queryKeys";

export function useOrgMembers() {
  return convertQueryResultToLoadable(
    useQuery({
      queryKey: ReactQueryKey.orgMembers(),
      queryFn: () => DashboardApiClient.getOrgMembers(),
    })
  );
}
