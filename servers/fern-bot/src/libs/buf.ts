<<<<<<< HEAD
import { createLoggingExecutable } from "@utils/createLoggingExecutable";
import execa from "execa";
import tmp from "tmp-promise";
import urlJoin from "url-join";
=======
import urlJoin from "url-join";
import { createLoggingExecutable, LoggingExecutable } from "../utils/createLoggingExecutable";
>>>>>>> ed23f63d7 (feat(proxy): Add ability to call gRPC endpoints)

const BUF_NPM_PACKAGE = "@bufbuild/buf";
const BUF_VERSION = "1.42.0";

export declare namespace Buf {
    export interface CurlRequest {
        /** The base URL to use for the call (e.g. https://acme.co) */
        baseUrl: string;
        /** The gRPC endpoint name (e.g. user.v1.UserService/GetUser) */
        endpoint: string;
        /** The headers to send along with the request (e.g. 'Authorization: Bearer ...') */
        headers: string[];
        /**
         * The path to the Protobuf schema files that define this API. If not specified,
         * it's assumed the server supports gRPC reflection.
         */
        schema?: string;
        /** Use gRPC to send the request. */
        grpc?: boolean;
        /** The request body (represented as JSON) to include in the request, if any */
        body?: unknown;
    }

    export interface CurlResponse {
        /** The response body received from the call, if any */
        body?: unknown;
    }
}

<<<<<<< HEAD
export type CLI = (args?: string[]) => execa.ExecaChildProcess<string>;

export class Buf {
    private cli: CLI | undefined;

    public async curl({ request }: { request: Buf.CurlRequest }): Promise<Buf.CurlResponse> {
        const cli = await this.getOrInstall();
        const response = await cli(this.getArgsForCurlRequest(request));
        if (response.exitCode !== 0) {
            return {
                body: response.stderr,
            };
        }
        return {
            body: response.stdout,
        };
    }

    private async getOrInstall(): Promise<CLI> {
        if (this.cli) {
            return this.cli;
        }
        const which = createLoggingExecutable("which", {
            cwd: process.cwd(),
        });
        try {
            await which(["buf"]);
        } catch (err) {
            console.log("buf is not installed");
            return this.install();
        }
        this.cli = this.createBufExecutable();
        return this.cli;
    }

    private async install(): Promise<CLI> {
        // Running the commands on Lambdas is a bit odd...specifically you can only write to tmp on a lambda
        // so here we make sure the CLI is bundled via the `external` block in serverless.yml
        // and then execute the command directly via node_modules, with the home and cache set to /tmp.
        const tmpDir = await tmp.dir();
        const tmpDirPath = tmpDir.path;
        process.env.NPM_CONFIG_CACHE = `${tmpDirPath}/.npm`;
        process.env.HOME = tmpDirPath;

        // Update config to allow `npm install` to work from within the `fern upgrade` command
        process.env.NPM_CONFIG_PREFIX = tmpDirPath;
        // Re-install the CLI to ensure it's at the correct path, given the updated config
        const install = await execa("npm", ["install", "-g", `${BUF_NPM_PACKAGE}@${BUF_VERSION}`]);
        if (install.exitCode === 0) {
            console.log(`Successfully installed ${BUF_NPM_PACKAGE}`);
        } else {
            const message = `Failed to install buf \n${install.stdout}\n${install.stderr}`;
            console.log(message);
            throw new Error(message);
        }

        this.cli = this.createBufExecutable();
        return this.cli;
    }

    private getArgsForCurlRequest(request: Buf.CurlRequest): string[] {
        const args = ["curl", this.getFullyQualifiedEndpoint(request)];
        for (const header of request.headers) {
            args.push(...["--header", header]);
=======
export class Buf {
    private cli: LoggingExecutable | undefined;

    public async curl({ request }: { request: Buf.CurlRequest }): Promise<Buf.CurlResponse> {
        const cli = await this.getOrInstall();
        const content = await cli(this.getArgsForCurlRequest(request));
        return {
            body: content.stdout,
        };
    }

    private async getOrInstall(): Promise<LoggingExecutable> {
        if (this.cli) {
            return this.cli;
        }
        this.cli = createLoggingExecutable("buf", {
            cwd: process.cwd(),
        });
        return this.install();
    }

    private async install(): Promise<LoggingExecutable> {
        const npm = createLoggingExecutable("npm", {
            cwd: process.cwd(),
        });
        console.log(`Installing ${BUF_NPM_PACKAGE} ...`);
        await npm(["install", "-f", "-g", `${BUF_NPM_PACKAGE}@${BUF_VERSION}`]);

        const cli = createLoggingExecutable("buf", {
            cwd: process.cwd(),
        });
        const version = await cli(["--version"]);
        console.log(`Successfully installed ${BUF_NPM_PACKAGE} version ${version.stdout}`);

        this.cli = cli;
        return cli;
    }

    private getArgsForCurlRequest(request: Buf.CurlRequest): string[] {
        const args = ["curl", this.getFullyQualifiedEndpoint(request)];
        for (const header of request.headers) {
            args.push(...["-H", header]);
>>>>>>> ed23f63d7 (feat(proxy): Add ability to call gRPC endpoints)
        }
        if (request.schema != null) {
            args.push(...["--schema", request.schema]);
        }
        if (request.grpc) {
<<<<<<< HEAD
            args.push(...["--protocol", "grpc"]);
        }
        if (request.body != null) {
            args.push(...["--data", JSON.stringify(request.body)]);
=======
            args.push("--grpc");
        }
        if (request.body != null) {
            args.push(...["-d", `'${JSON.stringify(request.body)}'`]);
>>>>>>> ed23f63d7 (feat(proxy): Add ability to call gRPC endpoints)
        }
        return args;
    }

    private getFullyQualifiedEndpoint({ baseUrl, endpoint }: Buf.CurlRequest): string {
        return urlJoin(baseUrl, endpoint);
    }
<<<<<<< HEAD

    private createBufExecutable(): CLI {
        return (args) => {
            return execa("npx", ["buf", ...(args ?? [])]);
        };
    }
=======
>>>>>>> ed23f63d7 (feat(proxy): Add ability to call gRPC endpoints)
}
