import projectsJson from "@/projects.json";
import { VercelProjectsSchema } from "@/projects/schema";
import { spawn } from "child_process";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { getVercelToken } from "./env";
import { applyProjectSettings } from "./settings";

const { projects } = VercelProjectsSchema.parse(projectsJson);

function getProjectSettings(name: string) {
    const proj = projects[name];
    if (!proj) {
        throw new Error(`Project '${name}' not found`);
    }
    return proj;
}

function exec(command: string, opts: { env?: NodeJS.ProcessEnv }) {
    return new Promise<void>((resolve, reject) => {
        const [cmd, ...args] = command.split(" ");

        if (cmd !== "vercel") {
            throw new Error("Only 'vercel' commands are allowed");
        }

        const verceljs = path.resolve(`${process.cwd()}/node_modules/vercel/dist/index.js`);

        const executable = path.resolve(process.execPath);

        const child = spawn(executable, [verceljs, ...args], { env: opts.env, cwd: process.cwd() });
        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);

        child.on("exit", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command '${command}' failed with code ${code}`));
            }
        });

        child.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command '${command}' failed with code ${code}`));
            }
        });

        child.on("error", (err) => {
            reject(err);
        });
    });
}

void yargs(hideBin(process.argv))
    .scriptName("vercel-scripts")
    .strict()
    .command({
        command: "projects",
        describe: "List Vercel projects",
        handler: () => {
            // eslint-disable-next-line no-console
            console.log(projects);
        },
    })
    .command({
        command: "deploy <project>",
        describe: "Deploy Vercel project",
        builder: (yargs) =>
            yargs.positional("project", { type: "string", demandOption: true }).options({
                // Add options here
                environment: {
                    type: "string",
                    description: "Environment to deploy to",
                    default: "preview",
                    choices: ["preview", "production"],
                },
            }),
        handler: async ({ project: projectName, environment }) => {
            const settings = getProjectSettings(projectName);

            // eslint-disable-next-line no-console
            console.log(`Deploying project '${projectName}' to ${environment}`);

            const project = await applyProjectSettings(projectName, settings);
            const env = { VERCEL_ORG_ID: project.accountId, VERCEL_PROJECT_ID: project.id };

            await exec(`vercel pull --yes --environment=${environment} --token ${getVercelToken()}`, {
                env,
            });

            try {
                await exec(
                    `vercel build --yes${environment === "preview" ? "" : " --prod"} --token ${getVercelToken()}`,
                    {
                        env,
                    },
                );
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error(e);
            }
        },
    })
    .demandCommand()
    .showHelpOnFail(true)
    .parse();
