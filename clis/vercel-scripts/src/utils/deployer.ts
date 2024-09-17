import { VercelClient } from "@fern-fern/vercel";
import { readFileSync } from "fs";
import { join } from "path";
import { UnreachableCaseError } from "ts-essentials";
import { exec } from "./exec.js";

export class VercelDeployer {
    private token: string;
    private teamName: string;
    private teamId: string;
    private environment: "preview" | "production";
    private cwd: string;
    private vercel: VercelClient;
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

    private shouldIgnoreBuild(pkg: string): boolean {
        try {
            exec("turbo-ignore", `pnpx turbo-ignore ${pkg} --fallback=HEAD^1`, { cwd: this.cwd });
        } catch (err) {
            if (typeof err === "object" && err && "status" in err && err.status === 1) {
                return false;
            }
        }
        return true;
    }

    private env(projectId: string): Record<string, string> {
        return {
            TURBO_TOKEN: this.token,
            TURBO_TEAM: this.teamName,
            VERCEL_ORG_ID: this.teamId,
            VERCEL_PROJECT_ID: projectId,
        };
    }

    private pull(project: { id: string; name: string }): void {
        exec(
            `[${this.environmentName}] Pull ${project.name} from Vercel (${project.id})`,
            `pnpx vercel pull --yes --environment=${this.environment} --token=${this.token}`,
            { env: this.env(project.id), cwd: this.cwd },
        );
    }

    private build(project: { id: string; name: string }): void {
        let command = `pnpx vercel build --yes --token=${this.token} --debug`;
        if (this.environment === "production") {
            command += " --prod";
        }
        exec(`[${this.environmentName}] Build bundle for ${project.name}`, command, {
            env: this.env(project.id),
            cwd: this.cwd,
        });
    }

    private deploy(project: { id: string; name: string }): string {
        let command = `pnpx vercel deploy --yes --prebuilt --token=${this.token} --archive=tgz`;
        if (this.environment === "production") {
            command += " --prod --skip-domain";
        }
        return exec(`[${this.environmentName}] Deploy bundle for ${project.name} to Vercel`, command, {
            stdio: "pipe",
            env: this.env(project.id),
            cwd: this.cwd,
        }).trim();
    }

    public promote(deploymentUrl: string): void {
        if (this.environment === "production") {
            exec(
                `[${this.environmentName}] Promote ${deploymentUrl}`,
                `pnpx vercel promote ${deploymentUrl} --token=${this.token}`,
                { cwd: this.cwd },
            );
        }
    }

    public async buildAndDeployToVercel(
        project: string,
        {
            force = false,
            skipDeploy = false,
        }: {
            force?: boolean;
            skipDeploy?: boolean;
        } = {},
    ): Promise<
        | {
              deploymentUrl: string;
              canPromote: boolean;
          }
        | undefined
    > {
        const prj = await this.vercel.projects.getProject(project, { teamId: this.teamId });
        const rootDir = join(this.cwd, prj.rootDirectory ?? "");
        const packageJson: { name: string } = JSON.parse(String(readFileSync(join(rootDir, "package.json"))));
        const subpackage = packageJson.name;

        if (!force && this.shouldIgnoreBuild(subpackage)) {
            return;
        }

        this.pull(prj);

        this.build(prj);

        if (skipDeploy) {
            return;
        }

        const deploymentUrl = this.deploy(prj);

        if (!deploymentUrl) {
            throw new Error("Deployment failed: no deployment URL returned");
        }

        let canPromote = this.environment === "production";

        if (canPromote) {
            /**
             * If the deployment is to the dev2 registry, we should automatically promote it
             * and not allow manual promotion.
             */
            const isDev2 = this.loadEnvFile().includes("registry-dev2.buildwithfern.com");

            if (isDev2) {
                this.promote(deploymentUrl);
                canPromote = false;
            }
        }

        return {
            deploymentUrl,
            canPromote,
        };
    }

    private loadEnvFile(): string {
        const dotvercel = join(this.cwd, ".vercel");
        const envfile = join(dotvercel, `.env.${this.environment}.local`);

        // eslint-disable-next-line no-console
        console.log("Loading env file:", envfile);

        return readFileSync(envfile, "utf-8");
    }
}
