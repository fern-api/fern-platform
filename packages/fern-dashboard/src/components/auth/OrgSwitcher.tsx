"use client";

import { getAccessToken } from "@auth0/nextjs-auth0";
import { GetOrganizations200ResponseOneOfInner } from "auth0";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export declare namespace OrgSwitcher {
  export interface Props {
    currentOrgId: string | undefined;
    organizations: GetOrganizations200ResponseOneOfInner[];
  }
}

export const OrgSwitcher = ({
  currentOrgId,
  organizations,
}: OrgSwitcher.Props) => {
  console.log({ currentOrgId });

  const onClickOrg = async (newOrgId: string) => {
    if (newOrgId === currentOrgId) {
      return;
    }

    await getAccessToken({
      authorizationParams: {
        org_id: newOrgId,
      },
    });
  };

  return (
    <Select value={currentOrgId} onValueChange={onClickOrg}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Organization" />
      </SelectTrigger>
      <SelectContent>
        {organizations.map((organization) => (
          <SelectItem key={organization.id} value={organization.id}>
            {organization.display_name} ({organization.id})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
