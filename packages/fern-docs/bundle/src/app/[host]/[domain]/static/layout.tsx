import "server-only";

import SharedLayout from "@/components/shared-layout";
import { createCachedDocsLoader } from "@/server/docs-loader";

export default async function Layout({
  children,
  params,
  headertabs,
  sidebar,
  versionSelect,
  explorer,
}: {
  children: React.ReactNode;
  params: Promise<{ host: string; domain: string }>;
  headertabs: React.ReactNode;
  sidebar: React.ReactNode;
  versionSelect: React.ReactNode;
  explorer: React.ReactNode;
}) {
  const { host, domain } = await params;
  const loader = await createCachedDocsLoader(host, domain);
  return (
    <SharedLayout
      loader={loader}
      headertabs={headertabs}
      versionSelect={versionSelect}
      sidebar={sidebar}
    >
      {children}
      {explorer}
    </SharedLayout>
  );
}
