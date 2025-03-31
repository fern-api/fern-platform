"use client";

import { SessionData } from "@auth0/nextjs-auth0/types";

import { useOrgMembersAndInvitations } from "@/state/useOrgMembersAndInvitations";
import { useOrganization } from "@/state/useOrganizations";
import { getOrgIdOrThrow } from "@/utils/getOrgIdOrThrow";

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

  const { orgMembersAndInvitations, reload: reloadOrgMembersAndInvitations } =
    useOrgMembersAndInvitations();

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Members"
        subtitle="Manage team members and invitations"
        rightContent={
          <div className="flex items-center">
            <InviteUserDialog
              orgId={orgId}
              org={org}
              onInvite={reloadOrgMembersAndInvitations}
            />
          </div>
        }
      />
      <MembersTable
        orgId={orgId}
        orgMembersAndInvitations={orgMembersAndInvitations}
        onRescindInvitation={reloadOrgMembersAndInvitations}
      />
    </div>
  );
}
