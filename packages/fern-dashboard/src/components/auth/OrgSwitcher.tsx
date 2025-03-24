"use client";

import { useEffect } from "react";

import { GetOrganizations200ResponseOneOfInner } from "auth0";
import { create } from "zustand";

import { getMyOrganizations } from "@/app/actions/getMyOrganizations";

import { OrgSwitcherSelect } from "./OrgSwitcherSelect";

type OrganizationsStore = {
  organizations: GetOrganizations200ResponseOneOfInner[];
  setOrganizations: (orgs: GetOrganizations200ResponseOneOfInner[]) => void;
};

export const useOrganizationsStore = create<OrganizationsStore>((set) => ({
  organizations: [],
  setOrganizations: (orgs: GetOrganizations200ResponseOneOfInner[]) =>
    set({ organizations: orgs }),
}));

export declare namespace OrgSwitcher {
  export interface Props {
    currentOrgId: string | undefined;
  }
}

export function OrgSwitcher({ currentOrgId }: OrgSwitcher.Props) {
  const organizations = useOrganizationsStore((state) => state.organizations);
  const setOrganizations = useOrganizationsStore(
    (state) => state.setOrganizations
  );

  useEffect(() => {
    async function run() {
      setOrganizations(await getMyOrganizations());
    }

    void run();
  }, [setOrganizations]);

  return (
    <OrgSwitcherSelect
      organizations={organizations}
      currentOrgId={currentOrgId}
    />
  );
}
