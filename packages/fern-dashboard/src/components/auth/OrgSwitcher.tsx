"use client";

import { Auth0OrgID } from "@/app/services/auth0/types";
import { useOrganizations } from "@/utils/useOrganizations";

import { OrgSwitcherSelect } from "./OrgSwitcherSelect";

export declare namespace OrgSwitcher {
  export interface Props {
    currentOrgId: Auth0OrgID | undefined;
  }
}

export function OrgSwitcher({ currentOrgId }: OrgSwitcher.Props) {
  const organizations = useOrganizations();

  return (
    <OrgSwitcherSelect
      organizations={organizations}
      currentOrgId={currentOrgId}
    />
  );
}
