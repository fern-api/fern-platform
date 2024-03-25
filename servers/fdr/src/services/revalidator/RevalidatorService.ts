import axios, { type AxiosInstance } from "axios";
import * as AxiosLogger from "axios-logger";
import { FdrApplication } from "../../app";
import { ParsedBaseUrl } from "../../util/ParsedBaseUrl";

export interface RevalidatePathSuccessResult {
    success: true;
    url: string;
}

export interface RevalidatePathErrorResult {
    success: false;
    url: string;
    message: string;
}

export type RevalidatedPaths = {
    successfulRevalidations: RevalidatePathSuccessResult[];
    failedRevalidations: RevalidatePathErrorResult[];
    revalidationFailed: boolean;
};

export interface RevalidatorService {
    revalidate(params: {
        fernUrl: ParsedBaseUrl;
        baseUrl: ParsedBaseUrl;
        app: FdrApplication;
    }): Promise<RevalidatedPaths>;
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
    }): Promise<RevalidatedPaths> {
        let successfulRevalidations: RevalidatePathSuccessResult[] = [];
        let failedRevalidations: RevalidatePathErrorResult[] = [];
        let revalidationFailed = false;

        try {
            const hostname = baseUrl.path != null ? fernUrl.hostname : baseUrl.hostname;
            const queryParams = baseUrl.path != null ? `?basePath=${baseUrl.path}` : "";
            const res = await this.axiosInstance.post(
                `https://${hostname}/api/revalidate-all${queryParams}`,
                undefined,
                {
                    timeout: 1000 * 300, // 5 minutes (matches vercel timeout)
                    headers: {
                        "x-fern-host": baseUrl.hostname,
                    },
                },
            );

            if (res.status >= 400) {
                revalidationFailed = true;
            }

            const data = res.data;
            if (data.successfulRevalidations != null) {
                successfulRevalidations = data.successfulRevalidations;
            }
            if (data.failedRevalidations != null) {
                failedRevalidations = data.failedRevalidations;
            }
        } catch (e) {
            app?.logger.error("Failed to revalidate paths", e);
            revalidationFailed = true;
        }

        return {
            failedRevalidations,
            successfulRevalidations,
            revalidationFailed,
        };
    }
}
