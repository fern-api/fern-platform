import { getFernToken } from "@/app/fern-token";

import DocsLayout from "../../_layout";

export default async function Layout({
  children,
  params,
  headertabs,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
  headertabs: React.ReactNode;
}) {
  const { domain } = await params;
  const fernToken = await getFernToken();
  return (
    <DocsLayout domain={domain} headertabs={headertabs} fernToken={fernToken}>
      {children}
    </DocsLayout>
  );
}
