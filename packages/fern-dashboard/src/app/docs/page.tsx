import { withPageAuthRequired } from "@auth0/nextjs-auth0";

import { getMyOrganizations } from "../actions/getMyOrganizations";

export default withPageAuthRequired(async () => {
  const { data: organizations } = await getMyOrganizations();
  return (
    <div>
      <pre>{JSON.stringify(organizations, undefined, 4)}</pre>
    </div>
  );
});
