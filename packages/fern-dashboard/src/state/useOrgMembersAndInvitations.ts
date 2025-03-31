"use client";

import { useCallback, useEffect } from "react";

import { create } from "zustand";

import { Loadable } from "@fern-ui/loadable";

import {
  OrgMembersAndInvitations,
  getCurrentOrgMembersAndInvitations,
} from "@/app/actions/getCurrentOrgMembersAndInvitations";

type OrgMembersAndInvitationsStore = {
  orgMembersAndInvitations: Loadable<OrgMembersAndInvitations>;
  setOrgMembersAndInvitations: (orgMembers: OrgMembersAndInvitations) => void;
};

export const useOrgMembersAndInvitationsStore =
  create<OrgMembersAndInvitationsStore>((set) => ({
    orgMembersAndInvitations: { type: "notStartedLoading" },
    setOrgMembersAndInvitations: (
      orgMembersAndInvitations: OrgMembersAndInvitations
    ) =>
      set({
        orgMembersAndInvitations: {
          type: "loaded",
          value: orgMembersAndInvitations,
        },
      }),
  }));

export function useOrgMembersAndInvitations() {
  const orgMembersAndInvitations = useOrgMembersAndInvitationsStore(
    (state) => state.orgMembersAndInvitations
  );
  const setOrgMembersAndInvitations = useOrgMembersAndInvitationsStore(
    (state) => state.setOrgMembersAndInvitations
  );

  const load = useCallback(async () => {
    const response = await getCurrentOrgMembersAndInvitations();
    setOrgMembersAndInvitations(response);
  }, [setOrgMembersAndInvitations]);

  useEffect(() => {
    async function run() {
      if (orgMembersAndInvitations.type === "notStartedLoading") {
        await load();
      }
    }

    void run();
  }, [load, orgMembersAndInvitations.type]);

  return {
    orgMembersAndInvitations,
    reload: load,
  };
}
