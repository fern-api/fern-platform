import { Vercel } from "@fern-fern/vercel";
import { logCommand } from "./loggingExeca.js";

export async function requestPromote(
  token: string,
  deployment: Vercel.GetDeploymentResponse
): Promise<void> {
  logCommand(`[Production] Promote ${deployment.url}`);

  if (deployment.target !== "production") {
    throw new Error("Deployment is not a production deployment");
  }

  if (deployment.readyState !== "READY") {
    throw new Error("Deployment is not ready");
  }

  if (deployment.readySubstate === "PROMOTED") {
    // eslint-disable-next-line no-console
    console.log(`Deployment ${deployment.name} is already promoted`);
    return;
  }

  if (deployment.readySubstate !== "STAGED") {
    throw new Error("Deployment is not staged for promotion");
  }

  if (!deployment.project) {
    throw new Error("Deployment has no project");
  }

  /**
   * The vercel promote cli command does not accept tokens as an argument, so we have to use the API directly
   *
   * Note: the fern-generated SDK doesn't work for this, so we have to use fetch directly
   */
  // await vercel.projects.requestPromote(deployment.project.id, deployment.id, { teamId });
  await fetch(
    `https://api.vercel.com/v10/projects/${deployment.project.id}/promote/${deployment.id}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      // required
      body: JSON.stringify({}),
    }
  );

  // eslint-disable-next-line no-console
  console.log(
    `Successfully requested promote of ${deployment.name} to ${deployment.project.name}`
  );
}
