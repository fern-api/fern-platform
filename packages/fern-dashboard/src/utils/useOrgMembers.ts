"use client";

import { useEffect } from "react";

import { GetMembers200ResponseOneOfInner } from "auth0";
import { create } from "zustand";

import { getCurrentOrgMembers } from "@/app/actions/getCurrentOrgMembers";

import { Loadable } from "./Loadable";

type OrgMembersStore = {
  orgMembers: Loadable<GetMembers200ResponseOneOfInner[]>;
  setOrgMembers: (orgMembers: GetMembers200ResponseOneOfInner[]) => void;
};

export const useOrgMembersStore = create<OrgMembersStore>((set) => ({
  orgMembers: { type: "notStartedLoading" },
  setOrgMembers: (orgMembers: GetMembers200ResponseOneOfInner[]) =>
    set({ orgMembers: { type: "loaded", value: orgMembers } }),
}));

export function useOrgMembers() {
  const orgMembers = useOrgMembersStore((state) => state.orgMembers);
  const setOrgMembers = useOrgMembersStore((state) => state.setOrgMembers);

  useEffect(() => {
    async function run() {
      if (orgMembers.type === "notStartedLoading") {
        const response = await getCurrentOrgMembers();
        setOrgMembers(response);
      }
    }

    void run();
  }, [orgMembers.type, setOrgMembers]);

  return orgMembers;
}
