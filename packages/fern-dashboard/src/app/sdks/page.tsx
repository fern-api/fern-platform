import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getSessionOrRedirect } from "@/lib/auth0";

export default async function SDKsPage() {
  const session = await getSessionOrRedirect();

  return (
    <ProtectedRoute>
      <AppLayout session={session}>
        <div>sdks!</div>
      </AppLayout>
    </ProtectedRoute>
  );
}
