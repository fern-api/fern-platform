import { ProtectedRoute } from "@/components/ProtectedRoute";
import Docs from "@/components/docs-page/Docs";

export default async function DocsPage() {
  return (
    <ProtectedRoute>
      <Docs />
    </ProtectedRoute>
  );
}
