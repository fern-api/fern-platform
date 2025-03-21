import { ProtectedRoute } from "@/components/ProtectedRoute";

export default async function DocsDomainPage(props: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await props.params;
  return (
    <ProtectedRoute>
      <div>{domain}</div>
    </ProtectedRoute>
  );
}
