import { VercelClient } from "@fern-fern/vercel";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { deployCommand } from "./commands/deploy.js";
import { getLastDeployCommand } from "./commands/last-deploy.js";
import { promoteCommand } from "./commands/promote.js";
import { revalidateAllCommand } from "./commands/revalidate-all.js";
import { rollbackCommand } from "./commands/rollback.js";
import { writefs } from "./cwd.js";
import { cleanDeploymentId } from "./utils/clean-id.js";
import { getVercelTokenFromGlobalConfig } from "./utils/global-config.js";
import { FernDocsRevalidator } from "./utils/revalidator.js";

void yargs(hideBin(process.argv))
  .scriptName("vercel-scripts")
  .strict()
  .options("token", {
    type: "string",
    description: "The Vercel API token",
    demandOption: true,
    default: process.env.VERCEL_TOKEN ?? getVercelTokenFromGlobalConfig(),
  })
  .options("teamId", {
    type: "string",
    description: "The Vercel team ID",
    demandOption: false,
    default: process.env.VERCEL_ORG_ID ?? "team_6FKOM5nw037hv8g2mTk3gaH7",
  })
  .options("teamName", {
    type: "string",
    description: "The Vercel team name",
    demandOption: false,
    default: "buildwithfern",
  })
  .command(
    "deploy <project>",
    "Deploy a project to Vercel",
    (argv) =>
      argv
        .positional("project", {
          type: "string",
          demandOption: true,
          description: "The project ID or project name to deploy",
        })
        .options("environment", {
          type: "string",
          description: "The environment to deploy to",
          demandOption: true,
          default: "preview",
          choices: ["preview" as const, "production" as const],
        })
        .option("skip-deploy", {
          type: "boolean",
          description: "Skip the deploy step",
        })
        .option("output", {
          type: "string",
          description: "The output file to write the preview URLs to",
          default: "deployment-url.txt",
        }),
    async ({
      project,
      environment,
      token,
      teamName,
      teamId,
      output,
      skipDeploy,
    }) => {
      await deployCommand({
        project,
        environment,
        token,
        teamName,
        teamId,
        output,
        skipDeploy,
      });

      process.exit(0);
    }
  )
  .command(
    "promote <deploymentUrl>",
    "Promote a deployment to production",
    (argv) =>
      argv
        .positional("deploymentUrl", {
          type: "string",
          demandOption: true,
        })
        .option("revalidate-all", {
          type: "boolean",
          description: "Revalidate the deployment (if it's fern docs)",
        }),
    async ({ deploymentUrl, token, teamId, revalidateAll }) => {
      await promoteCommand({
        deploymentIdOrUrl: deploymentUrl,
        token,
        teamId,
        revalidateAll,
      });
      process.exit(0);
    }
  )
  .command(
    "rollback <projectId>",
    "Rollback to the previous deployment",
    (argv) =>
      argv.positional("projectId", {
        type: "string",
        demandOption: true,
      }),
    async ({ projectId, token }) => {
      await rollbackCommand({ projectId, token });
      process.exit(0);
    }
  )
  .command(
    "revalidate-all <deploymentUrl>",
    "Revalidate all docs for a deployment",
    (argv) =>
      argv.positional("deploymentUrl", {
        type: "string",
        demandOption: true,
      }),
    async ({ deploymentUrl, token, teamId }) => {
      await revalidateAllCommand({
        token,
        teamId,
        deploymentIdOrUrl: deploymentUrl,
      });
      process.exit(0);
    }
  )
  .command(
    "preview.txt <deploymentUrl>",
    "Get preview URLs for a deployment",
    (argv) =>
      argv
        .positional("deploymentUrl", {
          type: "string",
          demandOption: true,
        })
        .option("output", {
          type: "string",
          description: "The output file to write the preview URLs to",
          default: "preview.txt",
        }),
    async ({ deploymentUrl, token, teamId, output }) => {
      const deployment = await new VercelClient({
        token,
      }).deployments.getDeployment(cleanDeploymentId(deploymentUrl), {
        teamId,
        withGitRepoInfo: "false",
      });

      if (!deployment.project) {
        throw new Error("Deployment does not have a project");
      }

      const revalidator = new FernDocsRevalidator({
        token,
        project: deployment.project.name,
        teamId,
      });

      const urls = await revalidator.getPreviewUrls(deploymentUrl);

      await writefs(
        output,
        `## PR Preview\n\n${urls.map((d) => `- [ ] [${d.name}](${d.url})`).join("\n")}`
      );

      process.exit(0);
    }
  )
  .command(
    "domains.txt <deploymentUrl>",
    "Get domains for a deployment",
    (argv) =>
      argv
        .positional("deploymentUrl", {
          type: "string",
          demandOption: true,
        })
        .option("output", {
          type: "string",
          description: "The output file to write the preview URLs to",
          default: "domains.txt",
        }),
    async ({ deploymentUrl, token, teamId, output }) => {
      if (!token) {
        throw new Error("VERCEL_TOKEN is required");
      }

      const deployment = await new VercelClient({
        token,
      }).deployments.getDeployment(cleanDeploymentId(deploymentUrl), {
        teamId,
        withGitRepoInfo: "false",
      });

      if (!deployment.project) {
        throw new Error("Deployment does not have a project");
      }

      const revalidator = new FernDocsRevalidator({
        token,
        project: deployment.project.name,
        teamId,
      });

      const urls = await revalidator.getDomains();

      await writefs(output, urls.join("\n"));

      process.exit(0);
    }
  )
  .command(
    "last-deploy.txt <project>",
    "Get the last deployment",
    (argv) =>
      argv
        .positional("project", { type: "string", demandOption: true })
        .option("branch", {
          type: "string",
          description: "The branch to get the last deployment for",
        })
        .options("environment", {
          type: "string",
          description: "The environment to deploy to",
          demandOption: true,
          default: "preview",
          choices: ["preview" as const, "production" as const],
        })
        .option("output", {
          type: "string",
          description: "The output file to write the preview URLs to",
          default: "last-deploy.txt",
        }),
    async ({ project, token, branch, output, environment }) => {
      await getLastDeployCommand({
        project,
        token,
        branch,
        output,
        environment,
      });
      process.exit(0);
    }
  )
  .command(
    "get-deployment <deploymentId>",
    "Get a deployment",
    (argv) =>
      argv.positional("deploymentId", {
        type: "string",
        demandOption: true,
      }),
    async ({ deploymentId, token, teamId }) => {
      const deployment = await new VercelClient({
        token,
      }).deployments.getDeployment(deploymentId, {
        teamId,
        withGitRepoInfo: "false",
      });

      console.log(JSON.stringify(deployment, null, 2));

      process.exit(0);
    }
  )
  .showHelpOnFail(false)
  .parse();
