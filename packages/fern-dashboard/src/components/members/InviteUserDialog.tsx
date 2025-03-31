import { useState } from "react";

import { PlusIcon } from "@heroicons/react/24/outline";
import { GetOrganizations200ResponseOneOfInner } from "auth0";

import { Auth0OrgID } from "@/app/services/auth0/types";

import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { InviteUserDialogContent } from "./InviteUserDialogContent";

export declare namespace InviteUserDialog {
  export interface Props {
    orgId: Auth0OrgID;
    org: GetOrganizations200ResponseOneOfInner | undefined;
    onInvite?: () => void;
  }
}

export function InviteUserDialog({
  org,
  orgId,
  onInvite,
}: InviteUserDialog.Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusIcon />
          Add member
        </Button>
      </DialogTrigger>
      <DialogContent
        onEscapeKeyDown={(event) => {
          event.preventDefault();
        }}
        onInteractOutside={(event) => {
          event.preventDefault();
        }}
      >
        <InviteUserDialogContent
          org={org}
          orgId={orgId}
          close={() => {
            setIsOpen(false);
          }}
          onInvite={onInvite}
        />
      </DialogContent>
    </Dialog>
  );
}
