import { cwd, writefs } from "../cwd.js";
import { VercelDeployer } from "../utils/deployer.js";
import { assertValidEnvironment } from "../utils/valid-env.js";

interface DeployArgs {
  project: string;
  environment: string;
  token: string;
  teamName: string;
  teamId: string;
  output: string;
  skipDeploy?: boolean;
}

export async function deployCommand({
  project,
  environment,
  token,
  teamName,
  teamId,
  output,
  skipDeploy,
}: DeployArgs): Promise<void> {
  assertValidEnvironment(environment);

  // eslint-disable-next-line no-console
  console.log(`Deploying project ${project} to ${environment} environment`);

  const cli = new VercelDeployer({
    token,
    teamName,
    teamId,
    environment,
    cwd: await cwd(),
  });

  const result = await cli.buildAndDeployToVercel(project, { skipDeploy });

  if (result) {
    await writefs(output, `https://${result.url}`);
  }
}
