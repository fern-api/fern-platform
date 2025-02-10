import { VercelClient } from "@fern-fern/vercel";
import { GetDeploymentResponse } from "@fern-fern/vercel/api/index.js";

import { cleanDeploymentId } from "../utils/clean-id.js";
import { FernDocsRevalidator } from "../utils/revalidator.js";

interface RevalidateAllArgs {
  token: string;
  teamId: string;
  deployment?: GetDeploymentResponse;
  deploymentIdOrUrl?: string;
}

export async function revalidateAllCommand({
  token,
  teamId,
  deployment,
  deploymentIdOrUrl,
}: RevalidateAllArgs): Promise<void> {
  if (!deployment) {
    if (!deploymentIdOrUrl) {
      throw new Error(
        "Either deployment or deploymentIdOrUrl must be provided"
      );
    }

    const vercel = new VercelClient({ token });
    deployment = await vercel.deployments.getDeployment(
      cleanDeploymentId(deploymentIdOrUrl)
    );
  }

  if (!deployment.project) {
    throw new Error("Deployment does not have a project");
  }

  const revalidator = new FernDocsRevalidator({
    token,
    project: deployment.project.id,
    teamId,
  });
  await revalidator.revalidateAll();
}
