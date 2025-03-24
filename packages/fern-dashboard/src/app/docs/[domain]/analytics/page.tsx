import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DocsSiteLayout } from "@/components/docs-page/DocsSiteLayout";
import { getSessionOrRedirect } from "@/lib/auth0";

export default async function Page(props: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await props.params;
  const session = await getSessionOrRedirect();

  return (
    <ProtectedRoute>
      <AppLayout session={session} currentDocsDomain={domain}>
        <DocsSiteLayout domain={domain}>
          <div>analytics</div>
        </DocsSiteLayout>
      </AppLayout>
    </ProtectedRoute>
  );
}
