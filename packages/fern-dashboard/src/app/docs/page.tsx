import { ProtectedRoute } from "@/components/ProtectedRoute";

import { getMyOrganizations } from "../actions/getMyOrganizations";

export default async function DocsPage() {
  const organizations = await getMyOrganizations();

  return (
    <ProtectedRoute>
      <div>
        <pre>{JSON.stringify(organizations, undefined, 4)}</pre>
      </div>
    </ProtectedRoute>
  );
}
