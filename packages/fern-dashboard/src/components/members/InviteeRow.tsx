import { UserMinusIcon } from "@heroicons/react/24/outline";
import { GetInvitations200ResponseOneOfInner } from "auth0";

import { rescindInvitation } from "@/app/actions/rescindInvitation";
import { Auth0OrgID } from "@/app/services/auth0/types";

import { DropdownMenuItem } from "../ui/dropdown-menu";
import { MemberOrInviteeRow } from "./MemberOrInviteeRow";

export declare namespace InviteeRow {
  export interface Props {
    orgId: Auth0OrgID;
    invitation: GetInvitations200ResponseOneOfInner;
    onRescind?: () => void;
  }
}

export function InviteeRow({ orgId, invitation, onRescind }: InviteeRow.Props) {
  const onClickRescind = async () => {
    await rescindInvitation({ orgId, invitationId: invitation.id });
    onRescind?.();
  };

  return (
    <MemberOrInviteeRow
      title={invitation.invitee.email}
      dropdownMenuItems={
        <>
          <DropdownMenuItem variant="destructive" onClick={onClickRescind}>
            <UserMinusIcon /> Rescind invitation
          </DropdownMenuItem>
        </>
      }
    />
  );
}
