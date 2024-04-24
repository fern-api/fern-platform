import { FernRevalidation, FernRevalidationClient } from "@fern-fern/revalidation-sdk";
import axios, { type AxiosInstance } from "axios";
import * as AxiosLogger from "axios-logger";
import { FdrApplication } from "../../app";
import { ParsedBaseUrl } from "../../util/ParsedBaseUrl";

export type RevalidatedPathsResponse = {
    response?: FernRevalidation.RevalidateAllV2Response;
    revalidationFailed: boolean;
};

export interface RevalidatorService {
    revalidate(params: {
        fernUrl: ParsedBaseUrl;
        baseUrl: ParsedBaseUrl;
        app: FdrApplication;
    }): Promise<RevalidatedPathsResponse>;
}

export class RevalidatorServiceImpl implements RevalidatorService {
    public readonly axiosInstance: AxiosInstance;
    // private readonly semaphore = new Semaphore(50);

    public constructor() {
        this.axiosInstance = axios.create();
        this.axiosInstance.interceptors.request.use(AxiosLogger.requestLogger);
    }

    /**
     * NOTE on basepath revalidation:
     *
     * When the baseUrl.path is not null, this means we are revalidating a custom domain which has configured subpath rewriting.
     * In this case, we don't have access to /api/revalidate-all and revalidation would fail.
     * Instead, we can hit https://org.docs.buildwithfern.com/api/revalidate-all?basePath=/path where the x-fern-host is set to custom-domain.com.
     * This works because custom-domain.com/path is rewritten to org.docs.buildwithfern.com/path
     *
     * Example prefetch request:
     * https://custom-domain.com/path/_next/data/.../static/custom-domain.com/path.json is rewritten to:
     * https://org.docs.buildwithfern.com/path/_next/data/.../static/custom-domain.com/path.json
     *
     * So `/static/custom-domain.com/path` is the path we need to revalidate on org.docs.buildwithfern.com
     */

    public async revalidate({
        fernUrl,
        baseUrl,
        app,
    }: {
        fernUrl: ParsedBaseUrl;
        baseUrl: ParsedBaseUrl;
        app?: FdrApplication;
    }): Promise<RevalidatedPathsResponse> {
        let revalidationFailed = false;
        try {
            const client = new FernRevalidationClient({
                environment: baseUrl.path != null ? `https://${fernUrl.hostname}` : `https://${baseUrl.hostname}`,
            });
            console.log(baseUrl.path != null ? fernUrl.hostname : baseUrl.hostname);
            const response = await client.revalidateAllV2({
                host: baseUrl.hostname,
                basePath: baseUrl.path != null ? baseUrl.path : "",
                xFernHost: baseUrl.hostname,
            });
            return {
                response,
                revalidationFailed: false,
            };
        } catch (e) {
            app?.logger.error("Failed to revalidate paths", e);
            revalidationFailed = true;
            console.log(e);
            return {
                response: undefined,
                revalidationFailed: true,
            };
        }
    }
}
