import { DocsSiteOverviewCard } from "@/components/docs-page/DocsSiteOverviewCard";

import { parseDocsUrlParam } from "../../../../utils/parseDocsUrlParam";

export default async function Page(props: {
  params: Promise<{ docsUrl: string }>;
}) {
  const docsUrl = parseDocsUrlParam(await props.params);

  return <DocsSiteOverviewCard docsUrl={docsUrl} />;
}
