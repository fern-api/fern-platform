import { VercelClient } from "@fern-fern/vercel";
import { writeFileSync } from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { promoteCommand } from "./commands/promote.js";
import { revalidateAllCommand } from "./commands/revalidate-all.js";
import { cwd } from "./cwd.js";
import { cleanDeploymentId } from "./utils/clean-id.js";
import { VercelDeployer } from "./utils/deployer.js";
import { FernDocsRevalidator } from "./utils/revalidator.js";
import { safeCommand } from "./utils/safeCommand.js";

function isValidEnvironment(environment: string): environment is "preview" | "production" {
    return environment === "preview" || environment === "production";
}

void yargs(hideBin(process.argv))
    .scriptName("vercel-scripts")
    .strict()
    .options("token", {
        type: "string",
        description: "The Vercel API token",
        demandOption: true,
        default: process.env.VERCEL_TOKEN,
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
                .option("skip-deploy", { type: "boolean", description: "Skip the deploy step" })
                .option("output", {
                    type: "string",
                    description: "The output file to write the preview URLs to",
                    default: "deployment-url.txt",
                }),
        async ({ project, environment, token, teamName, teamId, output, skipDeploy }) => {
            if (!isValidEnvironment(environment)) {
                throw new Error(`Invalid environment: ${environment}`);
            }

            // eslint-disable-next-line no-console
            console.log(`Deploying project ${project} to ${environment} environment`);

            const cli = new VercelDeployer({
                token,
                teamName,
                teamId,
                environment,
                cwd: cwd(),
            });

            const result = await cli.buildAndDeployToVercel(project, { skipDeploy });

            if (result) {
                writeFileSync(output, result.url);
            }

            process.exit(0);
        },
    )
    .command(
        "promote <deploymentUrl>",
        "Promote a deployment to production",
        (argv) =>
            argv.positional("deploymentUrl", { type: "string", demandOption: true }).option("revalidate-all", {
                type: "boolean",
                description: "Revalidate the deployment (if it's fern docs)",
            }),
        async ({ deploymentUrl, token, teamId, revalidateAll }) =>
            safeCommand(() => promoteCommand({ deploymentIdOrUrl: deploymentUrl, token, teamId, revalidateAll })),
    )
    .command(
        "revalidate-all <deploymentUrl>",
        "Revalidate all docs for a deployment",
        (argv) => argv.positional("deploymentUrl", { type: "string", demandOption: true }),
        async ({ deploymentUrl, token, teamId }) =>
            safeCommand(() => revalidateAllCommand({ token, teamId, deploymentIdOrUrl: deploymentUrl })),
    )
    .command(
        "preview.txt <deploymentUrl>",
        "Get preview URLs for a deployment",
        (argv) =>
            argv.positional("deploymentUrl", { type: "string", demandOption: true }).option("output", {
                type: "string",
                description: "The output file to write the preview URLs to",
                default: "preview.txt",
            }),
        async ({ deploymentUrl, token, teamId, output }) => {
            const deployment = await new VercelClient({ token }).deployments.getDeployment(
                cleanDeploymentId(deploymentUrl),
                { teamId, withGitRepoInfo: "false" },
            );

            if (!deployment.project) {
                throw new Error("Deployment does not have a project");
            }

            const revalidator = new FernDocsRevalidator({ token, project: deployment.project.name, teamId });

            const urls = await revalidator.getPreviewUrls(deploymentUrl);

            writeFileSync(output, `## PR Preview\n\n${urls.map((d) => `- [ ] [${d.name}](${d.url})`).join("\n")}`);

            process.exit(0);
        },
    )
    .command(
        "domains.txt <deploymentUrl>",
        "Get domains for a deployment",
        (argv) =>
            argv.positional("deploymentUrl", { type: "string", demandOption: true }).option("output", {
                type: "string",
                description: "The output file to write the preview URLs to",
                default: "domains.txt",
            }),
        async ({ deploymentUrl, token, teamId, output }) => {
            const deployment = await new VercelClient({ token }).deployments.getDeployment(
                cleanDeploymentId(deploymentUrl),
                { teamId, withGitRepoInfo: "false" },
            );

            if (!deployment.project) {
                throw new Error("Deployment does not have a project");
            }

            const revalidator = new FernDocsRevalidator({ token, project: deployment.project.name, teamId });

            const urls = await revalidator.getDomains();

            writeFileSync(output, urls.join("\n"));

            process.exit(0);
        },
    )
    .parse();
