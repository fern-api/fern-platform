import { VercelClient } from "@fern-fern/vercel";

/**
 * Perform an instant rollback to the previous deployment.
 *
 * This should be used ONLY when a production deployment has failed.
 */
export async function rollbackCommand({
  projectId,
  token,
}: {
  projectId: string;
  token: string;
}): Promise<void> {
  const vercel = new VercelClient({ token });

  const { deployments } = await vercel.deployments.getDeployments({
    projectId,
    rollbackCandidate: true,
    state: "READY",
    target: "production",
    limit: 2,
  });

  if (!deployments[1]) {
    throw new Error("No rollback candidate found.");
  }

  const deployment = deployments[1];

  /**
   * Vercel's OpenAPI doesn't have a rollback endpoint, so we have to use the API directly
   */
  await fetch(`/v9/projects/${projectId}/rollback/${deployment.uid}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    // required
    body: JSON.stringify({}),
  });

  console.log(`Successfully rolled back ${projectId} to ${deployment.url}`);
}
