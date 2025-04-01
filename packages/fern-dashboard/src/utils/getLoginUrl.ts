import { Auth0OrgID } from "@/app/services/auth0/types";

export function getLoginUrl({
  orgId,
  returnTo,
}: {
  orgId?: Auth0OrgID;
  returnTo?: string;
} = {}) {
  const searchParams = new URLSearchParams();
  if (orgId != null) {
    searchParams.append("organization", orgId);
  }
  if (returnTo != null) {
    searchParams.append("returnTo", returnTo);
  }
  return `/auth/login?${searchParams.toString()}`;
}
