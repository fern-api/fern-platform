import { getFernToken } from "@/app/fern-token";

import SharedLayout from "../../_layout";

export default async function Layout({
  children,
  params,
  headertabs,
  sidebar,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
  headertabs: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  const { domain } = await params;
  const fernToken = await getFernToken();
  return (
    <SharedLayout
      domain={domain}
      headertabs={headertabs}
      sidebar={sidebar}
      fernToken={fernToken}
    >
      {children}
    </SharedLayout>
  );
}
