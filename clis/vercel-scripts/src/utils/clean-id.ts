export function cleanDeploymentId(deploymentIdOrUrl: string): string {
  const toReplace = deploymentIdOrUrl.replace("https://", "");
  if (toReplace.length === 0) {
    throw new Error(`Invalid deployment ID or URL: ${deploymentIdOrUrl}`);
  }
  return toReplace;
}
