import { redirect } from "next/navigation";

import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import DocsZeroState from "@/components/docs-page/DocsZeroState";
import { getSessionOrRedirect } from "@/lib/auth0";
import { getOrLoadMyDocsSites } from "@/lib/useMyDocsSites";

export default async function Page() {
  const session = await getSessionOrRedirect();
  const { docsSites } = await getOrLoadMyDocsSites();

  const firstDocsSite = docsSites[0];
  if (firstDocsSite != null) {
    redirect(`/docs/${firstDocsSite.domain}`);
  }

  return (
    <ProtectedRoute>
      <AppLayout session={session}>
        <DocsZeroState session={session} />
      </AppLayout>
    </ProtectedRoute>
  );
}
