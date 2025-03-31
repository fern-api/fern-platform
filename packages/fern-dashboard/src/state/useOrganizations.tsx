"use client";

import { useEffect } from "react";

import { GetOrganizations200ResponseOneOfInner } from "auth0";
import { create } from "zustand";

import { Loadable } from "@fern-ui/loadable";

import { getMyOrganizations } from "@/app/services/auth0/helpers";
import { Auth0OrgID } from "@/app/services/auth0/types";

type OrganizationsStore = {
  organizations: Loadable<GetOrganizations200ResponseOneOfInner[]>;
  setOrganizations: (orgs: GetOrganizations200ResponseOneOfInner[]) => void;
};

export const useOrganizationsStore = create<OrganizationsStore>((set) => ({
  organizations: { type: "notStartedLoading" },
  setOrganizations: (orgs: GetOrganizations200ResponseOneOfInner[]) =>
    set({ organizations: { type: "loaded", value: orgs } }),
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
  if (organizations.type !== "loaded") {
    return undefined;
  }
  return organizations.value.find((org) => org.id === orgId);
}
