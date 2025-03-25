import { Page404 } from "@/components/Page404";
import { AppLayout } from "@/components/layout/AppLayout";

export default async function Page() {
  return (
    <AppLayout>
      <Page404 />
    </AppLayout>
  );
}
