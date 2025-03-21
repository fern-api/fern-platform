import { ProtectedRoute } from "@/components/ProtectedRoute";

export default async function MembersPage() {
  return (
    <ProtectedRoute>
      <div>members</div>
    </ProtectedRoute>
  );
}
