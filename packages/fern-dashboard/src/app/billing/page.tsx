import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getSessionOrRedirect } from "@/lib/auth0";

export default async function BillingPage() {
  const session = await getSessionOrRedirect();

  return (
    <ProtectedRoute>
      <AppLayout session={session}>
        <div>billing</div>
      </AppLayout>
    </ProtectedRoute>
  );
}
