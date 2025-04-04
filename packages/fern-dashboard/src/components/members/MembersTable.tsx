"use client";

import React from "react";

import { GetMembers200ResponseOneOfInner } from "auth0";

import { Loadable, getLoadableValue } from "@fern-ui/loadable";

import { Auth0UserID } from "@/app/services/auth0/types";
import { OrgInvitation } from "@/state/types";

import { InviteeRow } from "./InviteeRow";
import { MemberRow } from "./MemberRow";
import { SkeletonMemberRow } from "./SkeletonMemberRow";

export declare namespace MembersTable {
  export interface Props {
    userId: Auth0UserID;
    members: Loadable<GetMembers200ResponseOneOfInner[]>;
    invitations: Loadable<OrgInvitation[]>;
  }
}

export function MembersTable({
  userId,
  members,
  invitations,
}: MembersTable.Props) {
  const loadedInvitations = getLoadableValue(invitations);
  const loadedMembers = getLoadableValue(members);

  const getRows = () => {
    if (loadedInvitations == null || loadedMembers == null) {
      return (
        <>
          <SkeletonMemberRow nameWidth={8} emailWidth={19} />
          <SkeletonMemberRow nameWidth={14} emailWidth={24} />
          <SkeletonMemberRow nameWidth={12} emailWidth={22} />
        </>
      );
    }
    return [
      ...loadedInvitations.map((invitation) => (
        <InviteeRow
          key={invitation.id ?? invitation.inviteeEmail}
          invitation={invitation}
        />
      )),
      ...loadedMembers.map((member) => (
        <MemberRow
          key={member.user_id}
          member={member}
          currentUserId={userId}
        />
      )),
    ];
  };

  return (
    <div className="dark:bg-gray-1200 dark:border-gray-1100 flex flex-col rounded-xl border border-gray-500 bg-gray-100">
      {getRows()}
    </div>
  );
}
