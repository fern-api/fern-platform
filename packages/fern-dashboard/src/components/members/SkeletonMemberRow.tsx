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
      title={<Skeleton className="overflow-x-hidden">{name}</Skeleton>}
      subtitle={<Skeleton className="overflow-x-hidden">{email}</Skeleton>}
      forceShowDropownMenuTrigger
    />
  );
}
