import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { getSessionOrRedirect } from "@/lib/auth0";

export default async function Page() {
  const session = await getSessionOrRedirect();

  return (
    <ProtectedRoute>
      <AppLayout session={session}>
        <div>api keys!</div>
      </AppLayout>
    </ProtectedRoute>
  );
}
