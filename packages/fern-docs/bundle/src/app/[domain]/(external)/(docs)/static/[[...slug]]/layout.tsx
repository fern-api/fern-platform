import DocsLayout from "../../_layout";

export const dynamic = "force-static";

export default async function StaticDocsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;

  return <DocsLayout domain={domain}>{children}</DocsLayout>;
}
