import { Vercel, VercelClient } from "@fern-fern/vercel";
import { readFileSync } from "fs";
import { join } from "path";
import { UnreachableCaseError } from "ts-essentials";
import { cleanDeploymentId } from "./clean-id.js";
import { loggingExeca } from "./loggingExeca.js";
import { requestPromote } from "./promoter.js";

export class VercelDeployer {
    private token: string;
    private teamName: string;
    private teamId: string;
    private environment: "preview" | "production";
    private cwd: string;
    public vercel: VercelClient;
    constructor({
        token,
        teamName,
        teamId,
        environment,
        cwd,
    }: {
        token: string;
        teamName: string;
        teamId: string;
        environment: "preview" | "production";
        cwd: string;
    }) {
        this.token = token;
        this.teamName = teamName;
        this.teamId = teamId;
        this.environment = environment;
        this.cwd = cwd;
        this.vercel = new VercelClient({ token });
    }

    get environmentName(): string {
        if (this.environment === "preview") {
            return "Preview";
        } else if (this.environment === "production") {
            return "Production";
        } else if (this.environment === "production-dev2") {
            return "Production Dev2";
        } else {
            throw new UnreachableCaseError(this.environment);
        }
    }

    private env(projectId: string): Record<string, string> {
        return {
            TURBO_TOKEN: this.token,
            TURBO_TEAM: this.teamName,
            VERCEL_ORG_ID: this.teamId,
            VERCEL_PROJECT_ID: projectId,
        };
    }

    private async pull(project: { id: string; name: string }): Promise<void> {
        const args = [
            "vercel",
            "pull",
            "--yes",
            `--environment=${this.environment}`,
            `--token=${this.token}`,
        ];
        await loggingExeca(
            `[${this.environmentName}] Pull ${project.name} from Vercel (${project.id})`,
            "pnpx",
            args,
            {
                env: this.env(project.id),
                cwd: this.cwd,
            }
        );
    }

    private async build(project: { id: string; name: string }): Promise<void> {
        // let command = `pnpx vercel build --yes --token=${this.token} --debug`;
        const args = [
            "vercel",
            "build",
            "--yes",
            `--token=${this.token}`,
            "--debug",
        ];
        if (this.environment === "production") {
            args.push("--prod");
        }
        await loggingExeca(
            `[${this.environmentName}] Build bundle for ${project.name}`,
            "pnpx",
            args,
            {
                env: this.env(project.id),
                cwd: this.cwd,
            }
        );
    }

    private async deploy(
        project: { id: string; name: string },
        opts?: { prebuilt?: boolean }
    ): Promise<Vercel.GetDeploymentResponse> {
        // let command = `pnpx vercel deploy --yes --token=${this.token} --archive=tgz`;
        const args = [
            "vercel",
            "deploy",
            "--yes",
            `--token=${this.token}`,
            "--archive=tgz",
        ];

        if (opts?.prebuilt) {
            args.push("--prebuilt");
        }

        if (this.environment === "production") {
            args.push("--prod", "--skip-domain");
        }
        const result = await loggingExeca(
            `[${this.environmentName}] Deploy bundle for ${project.name} to Vercel`,
            "pnpx",
            args,
            {
                env: this.env(project.id),
                cwd: this.cwd,
            }
        );

        const deploymentUrl = String(result.stdout).trim();

        if (!deploymentUrl) {
            throw new Error("Deployment failed: no deployment URL returned");
        }

        const deployment = await this.vercel.deployments.getDeployment(
            cleanDeploymentId(deploymentUrl)
        );

        // logCommand(`[${this.environmentName}] Deployment URL: https://${deployment.url}`);

        // if ("inspectorUrl" in deployment) {
        //     logCommand(`[${this.environmentName}] Inspector URL: ${deployment.inspectorUrl}`);
        // }

        // eslint-disable-next-line no-console
        console.log("Deployment Source:", deployment.source);

        return deployment;
    }

    private async promote(
        deployment: Vercel.GetDeploymentResponse
    ): Promise<void> {
        if (this.environment === "production") {
            const isDev2 = this.loadEnvFile().includes(
                "registry-dev2.buildwithfern.com"
            );
            if (!isDev2) {
                return;
            }
            await requestPromote(this.token, deployment);
        }
    }

    public async buildAndDeployToVercel(
        project: string,
        { skipDeploy = false }: { skipDeploy?: boolean } = {}
    ): Promise<Vercel.GetDeploymentResponse | undefined> {
        const prj = await this.vercel.projects.getProject(project, {
            teamId: this.teamId,
        });

        await this.pull(prj);

        if (skipDeploy) {
            // build-only
            await this.build(prj);
            return;
        }

        const deployment = await this.deploy(prj, { prebuilt: false });

        await this.promote(deployment);

        return deployment;
    }

    private loadEnvFile(): string {
        const dotvercel = join(this.cwd, ".vercel");
        const envfile = join(dotvercel, `.env.${this.environment}.local`);

        // eslint-disable-next-line no-console
        console.log("Loading env file:", envfile);

        return readFileSync(envfile, "utf-8");
    }
}
