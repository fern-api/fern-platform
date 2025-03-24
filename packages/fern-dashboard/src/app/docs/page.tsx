import { redirect } from "next/navigation";

import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import DocsZeroState from "@/components/docs-page/DocsZeroState";
import { getSessionOrRedirect } from "@/lib/auth0";

import { getMyDocsSites } from "../actions/getMyDocsSites";

export default async function Page() {
  const session = await getSessionOrRedirect();

  // don't use the zustand hook because we want to block
  // rendering while we decide whether to redirect
  const { docsSites } = await getMyDocsSites();

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
