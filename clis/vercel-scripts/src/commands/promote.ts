import { VercelClient } from "@fern-fern/vercel";

import { cleanDeploymentId } from "../utils/clean-id.js";
import { requestPromote } from "../utils/promoter.js";
import { revalidateAllCommand } from "./revalidate-all.js";

interface PromoteArgs {
  deploymentIdOrUrl: string;
  token: string;
  teamId: string;
  revalidateAll?: boolean;
}

export async function promoteCommand({
  deploymentIdOrUrl,
  token,
  teamId,
  revalidateAll,
}: PromoteArgs): Promise<void> {
  const vercel = new VercelClient({ token });

  const deployment = await vercel.deployments.getDeployment(
    cleanDeploymentId(deploymentIdOrUrl),
    {
      teamId,
      withGitRepoInfo: "false",
    }
  );

  await requestPromote(token, deployment);

  if (revalidateAll) {
    await revalidateAllCommand({ token, teamId, deployment });
  }
}
