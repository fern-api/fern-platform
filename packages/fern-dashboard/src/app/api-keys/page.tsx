import { ProtectedRoute } from "@/components/ProtectedRoute";

export default async function ApiKeysPage() {
  return (
    <ProtectedRoute>
      <div>api keys!</div>
    </ProtectedRoute>
  );
}
