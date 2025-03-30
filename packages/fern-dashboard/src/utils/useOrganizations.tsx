"use client";

import { useEffect } from "react";

import { GetOrganizations200ResponseOneOfInner } from "auth0";
import { create } from "zustand";

import { getMyOrganizations } from "@/app/services/auth0/helpers";
import { Auth0OrgID } from "@/app/services/auth0/types";

type OrganizationsStore = {
  organizations: GetOrganizations200ResponseOneOfInner[];
  setOrganizations: (orgs: GetOrganizations200ResponseOneOfInner[]) => void;
};

export const useOrganizationsStore = create<OrganizationsStore>((set) => ({
  organizations: [],
  setOrganizations: (orgs: GetOrganizations200ResponseOneOfInner[]) =>
    set({ organizations: orgs }),
}));

export function useOrganizations() {
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

  return organizations;
}

export function useOrganization(orgId: Auth0OrgID) {
  const organizations = useOrganizations();
  return organizations.find((org) => org.id === orgId);
}
