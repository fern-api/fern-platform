"use client";

import { useEffect, useState } from "react";

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
  const [localValue, setLocalValue] = useState(currentOrgId);
  useEffect(() => {
    setLocalValue(currentOrgId);
  }, [currentOrgId]);

  const onClickOrg = async (newOrgId: string) => {
    if (newOrgId === currentOrgId) {
      return;
    }
    setLocalValue(newOrgId);
    window.location.href = `/auth/login?organization=${newOrgId}`;
  };

  return (
    <Select value={localValue} onValueChange={onClickOrg}>
      <SelectTrigger className="min-w-[180px]">
        <SelectValue placeholder="Organization" />
      </SelectTrigger>
      <SelectContent>
        {organizations.map((organization) => (
          <SelectItem key={organization.id} value={organization.id}>
            {organization.display_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
