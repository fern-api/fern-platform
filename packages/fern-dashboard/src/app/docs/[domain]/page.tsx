import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getSessionOrRedirect } from "@/lib/auth0";

export default async function DocsDomainPage(props: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await props.params;
  const session = await getSessionOrRedirect();

  return (
    <ProtectedRoute>
      <AppLayout session={session}>
        <div>{domain}</div>
      </AppLayout>
    </ProtectedRoute>
  );
}
