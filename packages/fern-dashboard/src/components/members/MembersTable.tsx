"use client";

import { useOrgMembers } from "@/utils/useOrgMembers";

import { MemberRow } from "./MemberRow";

export function MembersTable() {
  const members = useOrgMembers();

  if (members.type !== "loaded") {
    return null;
  }

  return (
    <div className="flex flex-col rounded-xl border border-gray-500 bg-gray-100">
      {members.value.map((member) => (
        <MemberRow key={member.user_id} member={member} />
      ))}
    </div>
  );
}
