import { useState } from "react";

import { PlusIcon } from "@heroicons/react/24/outline";
import { GetOrganizations200ResponseOneOfInner } from "auth0";

import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { InviteUserDialogContent } from "./InviteUserDialogContent";

export declare namespace InviteUserDialog {
  export interface Props {
    org: GetOrganizations200ResponseOneOfInner | undefined;
  }
}

export function InviteUserDialog({ org }: InviteUserDialog.Props) {
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
          close={() => {
            setIsOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
