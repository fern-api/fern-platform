import SharedLayout from "@/components/shared-layout";
import { createCachedDocsLoader } from "@/server/docs-loader";

export default async function Layout({
  children,
  params,
  headertabs,
  sidebar,
}: {
  children: React.ReactNode;
  params: Promise<{ host: string; domain: string }>;
  headertabs: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  const { host, domain } = await params;
  const loader = await createCachedDocsLoader(host, domain);
  return (
    <SharedLayout loader={loader} headertabs={headertabs} sidebar={sidebar}>
      {children}
    </SharedLayout>
  );
}
