"use client";

import { FullSessionData } from "@/app/services/auth0/getCurrentSession";
import { useOrgInvitations } from "@/state/useOrgInvitations";
import { useOrgMembers } from "@/state/useOrgMembers";
import { useOrganization } from "@/state/useOrganizations";

import { PageHeader } from "../layout/PageHeader";
import { InviteUserDialog } from "./InviteUserDialog";
import { MembersTable } from "./MembersTable";

export declare namespace MembersPage {
  export interface Props {
    session: FullSessionData;
  }
}

export function MembersPage({ session }: MembersPage.Props) {
  const { orgId } = session;

  const org = useOrganization(orgId);

  const invitations = useOrgInvitations();
  const members = useOrgMembers();

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
      <MembersTable orgId={orgId} members={members} invitations={invitations} />
    </div>
  );
}
