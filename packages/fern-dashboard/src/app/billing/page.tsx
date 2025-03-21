import { ProtectedRoute } from "@/components/ProtectedRoute";

export default async function BillingPage() {
  return (
    <ProtectedRoute>
      <div>billing</div>
    </ProtectedRoute>
  );
}
