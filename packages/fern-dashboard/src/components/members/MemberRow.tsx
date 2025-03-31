import { UserMinusIcon } from "@heroicons/react/24/outline";
import { GetMembers200ResponseOneOfInner } from "auth0";

import { DropdownMenuItem } from "../ui/dropdown-menu";
import { MemberOrInviteeRow } from "./MemberOrInviteeRow";

export declare namespace MemberRow {
  export interface Props {
    member: GetMembers200ResponseOneOfInner;
  }
}

export function MemberRow({ member }: MemberRow.Props) {
  return (
    <MemberOrInviteeRow
      title={member.name}
      subtitle={member.email}
      pictureUrl={member.picture}
      dropdownMenuItems={
        <DropdownMenuItem variant="destructive">
          <UserMinusIcon /> Remove member
        </DropdownMenuItem>
      }
    />
  );
}
