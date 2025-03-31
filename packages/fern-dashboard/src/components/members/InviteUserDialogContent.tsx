import { useMemo, useState } from "react";

import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { GetOrganizations200ResponseOneOfInner } from "auth0";
import { toast } from "sonner";

import { inviteUserToOrg } from "@/app/actions/inviteUserToOrg";
import { Auth0OrgID } from "@/app/services/auth0/types";
import { getOrgDisplayName } from "@/utils/getOrgDisplayName";

import { Button } from "../ui/button";
import {
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";

export declare namespace InviteUserDialogContent {
  export interface Props {
    orgId: Auth0OrgID;
    org: GetOrganizations200ResponseOneOfInner | undefined;
    onInvite?: () => void;
    close: () => void;
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InviteUserDialogContent({
  orgId,
  org,
  onInvite,
  close,
}: InviteUserDialogContent.Props) {
  const [email, setEmail] = useState("");

  const isValidEmail = useMemo(() => EMAIL_REGEX.test(email), [email]);

  const [isInviting, setIsInviting] = useState(false);
  const onClickInvite = async () => {
    if (!isValidEmail) {
      return;
    }

    setIsInviting(true);
    try {
      await inviteUserToOrg({ orgId, inviteeEmail: email });
      toast.success(`Invited ${email}`);
      onInvite?.();
      close();
    } catch (e) {
      console.error("Failed to invite user to org", e);
      toast.error(`Failed to invite ${email}`);
      setIsInviting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          Add member to {getOrgDisplayName(org) ?? "organization"}
        </DialogTitle>
        <DialogDescription>
          The user will receive an email to accept the invitation.
        </DialogDescription>
      </DialogHeader>
      <DialogBody>
        <div className="text-gray-1100 text-sm">Email</div>
        <Input
          placeholder="marty_mcfly@hillvalley.edu"
          disabled={isInviting}
          value={email}
          onChange={(e) => {
            setEmail(e.currentTarget.value);
          }}
        />
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={close} disabled={isInviting}>
          Cancel
        </Button>
        <Button disabled={!isValidEmail || isInviting} onClick={onClickInvite}>
          Send invitation
          <PaperAirplaneIcon />
        </Button>
      </DialogFooter>
    </>
  );
}
