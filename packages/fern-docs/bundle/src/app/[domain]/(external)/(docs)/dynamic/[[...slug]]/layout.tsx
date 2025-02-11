import DocsLayout from "../../_layout";

export default async function DynamicDocsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;

  return <DocsLayout domain={domain}>{children}</DocsLayout>;
}
