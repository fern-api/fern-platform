import React, { useState } from "react";

import { Skeleton } from "../ui/skeleton";
import { MemberOrInviteeRow } from "./MemberOrInviteeRow";

export declare namespace SkeletonMemberRow {
  export interface Props {
    nameWidth: number;
    emailWidth: number;
  }
}

export function SkeletonMemberRow({
  nameWidth,
  emailWidth,
}: SkeletonMemberRow.Props) {
  const [name] = useState("X".repeat(nameWidth));
  const [email] = useState("X".repeat(emailWidth));

  return (
    <MemberOrInviteeRow
      title={<Skeleton>{name}</Skeleton>}
      subtitle={<Skeleton>{email}</Skeleton>}
      forceShowDropownMenuTrigger
    />
  );
}
