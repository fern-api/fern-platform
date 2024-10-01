import { createLoggingExecutable, LoggingExecutable } from "../utils/createLoggingExecutable";
import tmp from "tmp-promise";
import urlJoin from "url-join";

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

export class Buf {
    private cli: LoggingExecutable | undefined;

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

    private async getOrInstall(): Promise<LoggingExecutable> {
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

    private async install(): Promise<LoggingExecutable> {
        // Lambdas can only write into temporary directories.
        const tmpDirPath = (await tmp.dir()).path;
        process.env.NPM_CONFIG_CACHE = `${tmpDirPath}/.npm`;
        process.env.HOME = tmpDirPath;

        const npm = createLoggingExecutable("npm", {
            cwd: process.cwd(),
        });
        console.debug(`Installing ${BUF_NPM_PACKAGE} ...`);
        await npm(["install", "-f", "-g", `${BUF_NPM_PACKAGE}@${BUF_VERSION}`]);

        const cli = this.createBufExecutable();
        const version = await cli(["--version"]);
        console.debug(`Successfully installed ${BUF_NPM_PACKAGE} version ${version.stdout}`);

        this.cli = cli;
        return cli;
    }

    private getArgsForCurlRequest(request: Buf.CurlRequest): string[] {
        const args = ["curl", this.getFullyQualifiedEndpoint(request)];
        for (const header of request.headers) {
            args.push(...["--header", header]);
        }
        if (request.schema != null) {
            args.push(...["--schema", request.schema]);
        }
        if (request.grpc) {
            args.push(...["--protocol", "grpc"]);
        }
        if (request.body != null) {
            args.push(...["--data", JSON.stringify(request.body)]);
        }
        return args;
    }

    private getFullyQualifiedEndpoint({ baseUrl, endpoint }: Buf.CurlRequest): string {
        return urlJoin(baseUrl, endpoint);
    }

    private createBufExecutable(): LoggingExecutable {
        return createLoggingExecutable("buf", {
            cwd: process.cwd(),
            reject: false, // We want to capture stderr without throwing.
        });
    }
}
