import {
  GetInvitations200ResponseOneOfInner,
  GetMembers200ResponseOneOfInner,
} from "auth0";

import { sort } from "@/utils/sort";

import {
  getCurrentOrgInvitations,
  getCurrentOrgMembers,
} from "../services/auth0/helpers";

export interface OrgMembersAndInvitations {
  members: GetMembers200ResponseOneOfInner[];
  invitations: GetInvitations200ResponseOneOfInner[];
}

export async function getCurrentOrgMembersAndInvitations(): Promise<OrgMembersAndInvitations> {
  const [members, invitations] = await Promise.all([
    getCurrentOrgMembers(),
    getCurrentOrgInvitations(),
  ]);

  sort(members, (a, b) => (a.name < b.name ? -1 : 1));
  sort(invitations, (a, b) => (a.invitee.email < b.invitee.email ? -1 : 1));

  return { members, invitations };
}
