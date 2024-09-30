import urlJoin from "url-join";
import { createLoggingExecutable, LoggingExecutable } from "../utils/createLoggingExecutable";

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
        const args = [this.getFullyQualifiedEndpoint(request)];
        for (const header of request.headers) {
            args.push(...["-H", header]);
        }
        if (request.schema != null) {
            args.push(...["--schema", request.schema]);
        }
        if (request.grpc) {
            args.push("--grpc");
        }
        if (request.body != null) {
            args.push(...["-d", `'${JSON.stringify(request.body)}'`]);
        }
        return args;
    }

    private getFullyQualifiedEndpoint({ baseUrl, endpoint }: Buf.CurlRequest): string {
        return urlJoin(baseUrl, endpoint);
    }
}
