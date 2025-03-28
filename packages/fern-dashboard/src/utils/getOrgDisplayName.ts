import { GetOrganizations200ResponseOneOfInner } from "auth0";

export function getOrgDisplayName(
  org: GetOrganizations200ResponseOneOfInner | undefined
) {
  return org?.display_name ?? org?.name;
}
