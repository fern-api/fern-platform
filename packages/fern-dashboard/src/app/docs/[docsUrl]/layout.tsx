import { DocsSiteLayout } from "@/components/docs-page/DocsSiteLayout";
import { parseDocsUrlParam } from "@/lib/parseDocsUrlParam";

export default async function Layout({
  params,
  children,
}: Readonly<{
  params: Promise<{ docsUrl: string }>;
  children: React.JSX.Element;
}>) {
  return (
    <DocsSiteLayout docsUrl={parseDocsUrlParam(await params)}>
      {children}
    </DocsSiteLayout>
  );
}
