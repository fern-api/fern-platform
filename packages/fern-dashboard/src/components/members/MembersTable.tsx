"use client";

import { Loadable } from "@fern-ui/loadable";

import { OrgMembersAndInvitations } from "@/app/actions/getCurrentOrgMembersAndInvitations";
import { Auth0OrgID } from "@/app/services/auth0/types";

import { InviteeRow } from "./InviteeRow";
import { MemberRow } from "./MemberRow";

export declare namespace MembersTable {
  export interface Props {
    orgId: Auth0OrgID;
    orgMembersAndInvitations: Loadable<OrgMembersAndInvitations>;
    onRescindInvitation?: () => void;
  }
}

export function MembersTable({
  orgId,
  orgMembersAndInvitations,
  onRescindInvitation,
}: MembersTable.Props) {
  if (orgMembersAndInvitations.type !== "loaded") {
    return null;
  }

  return (
    <div className="dark:bg-gray-1200 dark:border-gray-1100 flex flex-col rounded-xl border border-gray-500 bg-gray-100">
      {orgMembersAndInvitations.value.invitations.map((invitation) => (
        <InviteeRow
          key={invitation.id}
          orgId={orgId}
          invitation={invitation}
          onRescind={onRescindInvitation}
        />
      ))}
      {orgMembersAndInvitations.value.members.map((member) => (
        <MemberRow key={member.user_id} member={member} />
      ))}
    </div>
  );
}
