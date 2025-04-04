import { UserMinusIcon } from "@heroicons/react/24/outline";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GetMembers200ResponseOneOfInner } from "auth0";
import { toast } from "sonner";

import { removeUserFromOrg } from "@/app/actions/removeUserFromOrg";
import { Auth0UserID } from "@/app/services/auth0/types";
import { ReactQueryKey, inferQueryData } from "@/state/queryKeys";

import { DropdownMenuItem } from "../ui/dropdown-menu";
import { MemberOrInviteeRow } from "./MemberOrInviteeRow";

export declare namespace MemberRow {
  export interface Props {
    member: GetMembers200ResponseOneOfInner;
    currentUserId: Auth0UserID;
  }
}

export function MemberRow({ member, currentUserId }: MemberRow.Props) {
  const queryClient = useQueryClient();
  const removeMember = useMutation({
    mutationFn: () =>
      removeUserFromOrg({ userIdToRemove: Auth0UserID(member.user_id) }),
    onMutate: async () => {
      const queryKey = ReactQueryKey.orgMembers();
      await queryClient.cancelQueries({ queryKey });

      const previousMembers =
        queryClient.getQueryData<inferQueryData<typeof queryKey>>(queryKey);

      queryClient.setQueryData<inferQueryData<typeof queryKey>>(
        queryKey,
        (previousMembers) =>
          previousMembers != null
            ? previousMembers.filter((m) => m.user_id !== member.user_id)
            : previousMembers
      );

      return { previousMembers };
    },
    onError: (error, _variables, context) => {
      console.error(
        `Failed to remove ${member.name} (${member.email}, ${member.email})`,
        error
      );
      toast.error(`Failed to remove ${member.name}`);
      if (context?.previousMembers != null) {
        const queryKey = ReactQueryKey.orgMembers();
        queryClient.setQueryData<inferQueryData<typeof queryKey>>(
          queryKey,
          context.previousMembers
        );
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ReactQueryKey.orgMembers(),
      });
    },
  });

  return (
    <MemberOrInviteeRow
      title={member.name}
      subtitle={member.email}
      pictureUrl={member.picture}
      dropdownMenuItems={
        currentUserId !== member.user_id ? (
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              removeMember.mutate();
            }}
          >
            <UserMinusIcon /> Remove member
          </DropdownMenuItem>
        ) : undefined
      }
    />
  );
}
