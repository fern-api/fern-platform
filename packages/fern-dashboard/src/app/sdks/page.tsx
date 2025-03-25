import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";

export default async function Page() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <div>sdks!</div>
      </AppLayout>
    </ProtectedRoute>
  );
}
