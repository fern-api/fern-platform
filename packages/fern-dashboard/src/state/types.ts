export interface OrgInvitation {
  // no IDs for optimistic writes
  id: string | undefined;
  inviteeEmail: string;
}
