"use client";

import { GetMembers200ResponseOneOfInner } from "auth0";

import { Loadable, getLoadableValue } from "@fern-ui/loadable";

import { Auth0OrgID } from "@/app/services/auth0/types";
import { OrgInvitation } from "@/state/types";

import { InviteeRow } from "./InviteeRow";
import { MemberRow } from "./MemberRow";

export declare namespace MembersTable {
  export interface Props {
    orgId: Auth0OrgID;
    members: Loadable<GetMembers200ResponseOneOfInner[]>;
    invitations: Loadable<OrgInvitation[]>;
  }
}

export function MembersTable({
  orgId,
  members,
  invitations,
}: MembersTable.Props) {
  return (
    <div className="dark:bg-gray-1200 dark:border-gray-1100 flex flex-col rounded-xl border border-gray-500 bg-gray-100">
      {getLoadableValue(invitations)?.map((invitation) => (
        <InviteeRow
          key={invitation.id ?? invitation.inviteeEmail}
          orgId={orgId}
          invitation={invitation}
        />
      ))}
      {getLoadableValue(members)?.map((member) => (
        <MemberRow key={member.user_id} member={member} />
      ))}
    </div>
  );
}
