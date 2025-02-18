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
  return (
    <SharedLayout domain={domain} headertabs={headertabs} sidebar={sidebar}>
      {children}
    </SharedLayout>
  );
}
