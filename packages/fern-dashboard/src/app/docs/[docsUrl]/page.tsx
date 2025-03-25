import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DocsSiteLayout } from "@/components/docs-page/DocsSiteLayout";
import { DocsSiteOverviewCard } from "@/components/docs-page/DocsSiteOverviewCard";
import { AppLayout } from "@/components/layout/AppLayout";

import { parseDocsUrlParam } from "./parseDocsUrlParam";

export default async function Page(props: {
  params: Promise<{ docsUrl: string }>;
}) {
  const docsUrl = parseDocsUrlParam(await props.params);

  return (
    <ProtectedRoute>
      <AppLayout currentDocsUrl={docsUrl}>
        <DocsSiteLayout docsUrl={docsUrl}>
          <DocsSiteOverviewCard docsUrl={docsUrl} />
        </DocsSiteLayout>
      </AppLayout>
    </ProtectedRoute>
  );
}
