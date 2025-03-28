"use client";

import { useOrgMembers } from "@/utils/useOrgMembers";

import { MemberRow } from "./MemberRow";

export function MembersTable() {
  const members = useOrgMembers();

  if (members.type !== "loaded") {
    return null;
  }

  return (
    <div className="dark:bg-gray-1200 dark:border-gray-1100 flex flex-col rounded-xl border border-gray-500 bg-gray-100">
      {members.value.map((member) => (
        <MemberRow key={member.user_id} member={member} />
      ))}
    </div>
  );
}
