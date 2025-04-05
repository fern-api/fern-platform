import { getCurrentSession } from "@/app/services/auth0/getCurrentSession";
import { DocsSiteLayout } from "@/components/docs-page/DocsSiteLayout";
import { parseDocsUrlParam } from "@/utils/parseDocsUrlParam";

export default async function Layout({
  params,
  children,
}: Readonly<{
  params: Promise<{ docsUrl: string }>;
  children: React.JSX.Element;
}>) {
  const docsUrl = parseDocsUrlParam(await params);
  const { orgId } = await getCurrentSession();

  return (
    <DocsSiteLayout docsUrl={docsUrl} orgId={orgId}>
      {children}
    </DocsSiteLayout>
  );
}
