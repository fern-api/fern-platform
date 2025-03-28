"use client";

import { SessionData } from "@auth0/nextjs-auth0/types";

import { getOrgIdOrThrow } from "@/utils/getOrgIdOrThrow";
import { useOrganization } from "@/utils/useOrganizations";

import { PageHeader } from "../layout/PageHeader";
import { InviteUserDialog } from "./InviteUserDialog";
import { MembersTable } from "./MembersTable";

export declare namespace MembersPage {
  export interface Props {
    session: SessionData;
  }
}

export function MembersPage({ session }: MembersPage.Props) {
  const orgId = getOrgIdOrThrow(session);
  const org = useOrganization(orgId);

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Members"
        subtitle="Manage team members and invitations"
        rightContent={
          <div className="flex items-center">
            <InviteUserDialog orgId={orgId} org={org} />
          </div>
        }
      />
      <MembersTable />
    </div>
  );
}
