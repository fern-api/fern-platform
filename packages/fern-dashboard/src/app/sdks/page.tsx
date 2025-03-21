import { ProtectedRoute } from "@/components/ProtectedRoute";

export default async function SDKsPage() {
  return (
    <ProtectedRoute>
      <div>sdks</div>
    </ProtectedRoute>
  );
}
