import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Docs from "@/components/docs-page/Docs";
import { getSessionOrRedirect } from "@/lib/auth0";

export default async function DocsPage() {
  const session = await getSessionOrRedirect();

  return (
    <ProtectedRoute>
      <AppLayout session={session}>
        <Docs />
      </AppLayout>
    </ProtectedRoute>
  );
}
