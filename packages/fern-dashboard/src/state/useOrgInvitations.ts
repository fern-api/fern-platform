"use client";

import { useQuery } from "@tanstack/react-query";

import { DashboardApiClient } from "@/app/services/dashboard-api/client";

import { convertQueryResultToLoadable } from "./convertQueryResultToLoadable";
import { ReactQueryKey, inferQueryData } from "./queryKeys";
import { OrgInvitation } from "./types";

const QUERY_KEY = ReactQueryKey.orgInvitations();

export function useOrgInvitations() {
  return convertQueryResultToLoadable(
    useQuery<inferQueryData<typeof QUERY_KEY>>({
      queryKey: QUERY_KEY,
      queryFn: async () => {
        const invitations = await DashboardApiClient.getOrgInvitations();
        return invitations.map(
          (invitation): OrgInvitation => ({
            id: invitation.id,
            inviteeEmail: invitation.invitee.email,
          })
        );
      },
    })
  );
}
