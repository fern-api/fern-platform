const deploymentId = process.env.NEXT_DEPLOYMENT_ID;

// appears to be a browser bug where `Headers` object is not settable, so we will use a plain object instead
export function withSkewProtection(
  h?: Record<string, string>
): Record<string, string> | undefined {
  if (!deploymentId) {
    return h;
  }

  return { ...h, "X-Deployment-Id": deploymentId };
}
