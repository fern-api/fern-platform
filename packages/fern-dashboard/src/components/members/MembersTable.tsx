"use client";

import { useOrgMembers } from "@/lib/useOrgMembers";

import { MemberRow } from "./MemberRow";

export function MembersTable() {
  const members = useOrgMembers();

  if (members.type !== "loaded") {
    return null;
  }

  return (
    <div className="flex flex-col">
      {members.value.map((member) => (
        <MemberRow key={member.user_id} member={member} />
      ))}
    </div>
  );
}
