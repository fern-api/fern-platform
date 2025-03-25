import { redirect } from "next/navigation";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DocsZeroState } from "@/components/docs-page/DocsZeroState";
import { AppLayout } from "@/components/layout/AppLayout";
import { constructDocsUrlParam } from "@/lib/constructDocsUrlParam";
import { getDocsSiteUrl } from "@/lib/getDocsSiteUrl";

import { getMyDocsSites } from "../actions/getMyDocsSites";

export default async function Page() {
  // don't use the zustand hook because we want to block
  // rendering while we decide whether to redirect
  const { docsSites } = await getMyDocsSites();

  const firstDocsSite = docsSites[0];
  if (firstDocsSite != null) {
    redirect(`/docs/${constructDocsUrlParam(getDocsSiteUrl(firstDocsSite))}`);
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <DocsZeroState />
      </AppLayout>
    </ProtectedRoute>
  );
}
