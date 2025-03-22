import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getSessionOrRedirect } from "@/lib/auth0";

export default async function ApiKeysPage() {
  const session = await getSessionOrRedirect();

  return (
    <ProtectedRoute>
      <AppLayout session={session}>
        <div>api keys!</div>
      </AppLayout>
    </ProtectedRoute>
  );
}
