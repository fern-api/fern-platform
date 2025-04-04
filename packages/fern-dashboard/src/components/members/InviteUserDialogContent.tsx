import { useMemo, useState } from "react";

import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GetOrganizations200ResponseOneOfInner } from "auth0";
import { toast } from "sonner";

import { inviteUserToOrg } from "@/app/actions/inviteUserToOrg";
import { ReactQueryKey, inferQueryData } from "@/state/queryKeys";
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
    org: GetOrganizations200ResponseOneOfInner | undefined;
    close: () => void;
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InviteUserDialogContent({
  org,
  close,
}: InviteUserDialogContent.Props) {
  const [email, setEmail] = useState("");

  const isValidEmail = useMemo(() => EMAIL_REGEX.test(email), [email]);

  const queryClient = useQueryClient();
  const inviteUser = useMutation({
    mutationFn: () => inviteUserToOrg({ inviteeEmail: email }),
    onMutate: async () => {
      const queryKey = ReactQueryKey.orgInvitations();
      await queryClient.cancelQueries({ queryKey });

      const previousInvitations =
        queryClient.getQueryData<inferQueryData<typeof queryKey>>(queryKey);

      queryClient.setQueryData<inferQueryData<typeof queryKey>>(
        queryKey,
        (oldInvitations = []) => [
          { id: undefined, inviteeEmail: email },
          ...oldInvitations,
        ]
      );

      return { previousInvitations };
    },
    onError: (error, _variables, context) => {
      console.error(`Failed to invite ${email}`, error);
      toast.error(`Failed to invite ${email}`);
      if (context?.previousInvitations != null) {
        const queryKey = ReactQueryKey.orgInvitations();
        queryClient.setQueryData<inferQueryData<typeof queryKey>>(
          queryKey,
          context.previousInvitations
        );
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ReactQueryKey.orgInvitations(),
      });
    },
  });

  const isInviting = inviteUser.isPending;

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
            setEmail(e.currentTarget.value.trim());
          }}
        />
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={close} disabled={isInviting}>
          Cancel
        </Button>
        <Button
          disabled={!isValidEmail || isInviting}
          onClick={() => {
            inviteUser.mutate();
            close();
          }}
        >
          Send invitation
          <PaperAirplaneIcon />
        </Button>
      </DialogFooter>
    </>
  );
}
