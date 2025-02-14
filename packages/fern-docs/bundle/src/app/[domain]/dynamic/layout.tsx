import DocsLayout from "../_layout";

export default function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  return (
    <DocsLayout params={params} authed>
      {children}
    </DocsLayout>
  );
}
