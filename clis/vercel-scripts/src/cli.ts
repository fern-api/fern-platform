import { VercelClient } from "@fern-fern/vercel";
import { writeFileSync } from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { cwd } from "./cwd.js";
import { VercelDeployer } from "./utils/deployer.js";
import { DocsRevalidator } from "./utils/revalidator.js";

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
                .option("force", { type: "boolean", description: "Always deploy, even if the project is up-to-date" })
                .option("output", {
                    type: "string",
                    description: "The output file to write the preview URLs to",
                    default: "deployment-url.txt",
                }),
        async ({ project, environment, token, teamId, output, skipDeploy, force }) => {
            if (!isValidEnvironment(environment)) {
                throw new Error(`Invalid environment: ${environment}`);
            }

            // eslint-disable-next-line no-console
            console.log(`Deploying project ${project} to ${environment} environment`);

            const cli = new VercelDeployer({
                token,
                teamId,
                environment,
                cwd: cwd(),
            });

            const result = await cli.buildAndDeployToVercel(project, { skipDeploy, force });

            if (result) {
                // eslint-disable-next-line no-console
                console.log("Deployed to:", result.deploymentUrl);

                writeFileSync(output, result.deploymentUrl);
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
        async ({ deploymentUrl, token, teamId, revalidateAll }) => {
            const deployment = await new VercelClient({ token }).deployments.getDeployment(deploymentUrl);

            if (deployment.target !== "production") {
                // eslint-disable-next-line no-console
                console.error("Deployment is not a production deployment");
                process.exit(1);
            } else if (deployment.readySubstate !== "STAGED") {
                // eslint-disable-next-line no-console
                console.error("Deployment is not staged");
                process.exit(1);
            } else if (!deployment.project) {
                // eslint-disable-next-line no-console
                console.error("Deployment does not have a project");
                process.exit(1);
            }

            if (revalidateAll) {
                const revalidator = new DocsRevalidator({ token, project: deployment.project.name, teamId });

                await revalidator.revalidateAll();
            }

            process.exit(0);
        },
    )
    .command(
        "revalidate-all <deploymentUrl>",
        "Revalidate all docs for a deployment",
        (argv) => argv.positional("deploymentUrl", { type: "string", demandOption: true }),
        async ({ deploymentUrl, token, teamId }) => {
            const revalidator = new DocsRevalidator({ token, project: deploymentUrl, teamId });

            await revalidator.revalidateAll();

            process.exit(0);
        },
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
            const deployment = await new VercelClient({ token }).deployments.getDeployment(deploymentUrl);

            if (!deployment.project) {
                throw new Error("Deployment does not have a project");
            }

            const revalidator = new DocsRevalidator({ token, project: deployment.project.name, teamId });

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
            const deployment = await new VercelClient({ token }).deployments.getDeployment(deploymentUrl);

            if (!deployment.project) {
                throw new Error("Deployment does not have a project");
            }

            const revalidator = new DocsRevalidator({ token, project: deployment.project.name, teamId });

            const urls = await revalidator.getDomains();

            writeFileSync(output, urls.join("\n"));

            process.exit(0);
        },
    )
    .parse();
