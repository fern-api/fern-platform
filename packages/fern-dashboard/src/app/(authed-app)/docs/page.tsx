import { redirect } from "next/navigation";

import { DocsZeroState } from "@/components/docs-page/DocsZeroState";
import { constructDocsUrlParam } from "@/utils/constructDocsUrlParam";
import { getDocsSiteUrl } from "@/utils/getDocsSiteUrl";

import getMyDocsSites from "../../api/get-my-docs-sites/handler";
import { getCurrentSession } from "../../services/auth0/getCurrentSession";

export default async function Page() {
  const { session, orgId } = await getCurrentSession();

  const { docsSites } = await getMyDocsSites({
    token: session.tokenSet.accessToken,
    orgId,
  });

  const firstDocsSite = docsSites[0];
  if (firstDocsSite != null) {
    redirect(`/docs/${constructDocsUrlParam(getDocsSiteUrl(firstDocsSite))}`);
  }

  return <DocsZeroState user={session.user} />;
}
