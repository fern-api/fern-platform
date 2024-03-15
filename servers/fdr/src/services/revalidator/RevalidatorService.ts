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
    revalidate(params: { baseUrl: ParsedBaseUrl; app: FdrApplication }): Promise<RevalidatedPaths>;
}

export class RevalidatorServiceImpl implements RevalidatorService {
    public readonly axiosInstance: AxiosInstance;
    // private readonly semaphore = new Semaphore(50);

    public constructor() {
        this.axiosInstance = axios.create();
        // @ts-expect-error See https://github.com/hg-pyun/axios-logger/issues/131
        this.axiosInstance.interceptors.request.use(AxiosLogger.requestLogger);
    }

    public async revalidate({
        baseUrl,
        app,
    }: {
        baseUrl: ParsedBaseUrl;
        app?: FdrApplication;
    }): Promise<RevalidatedPaths> {
        let successfulRevalidations: RevalidatePathSuccessResult[] = [];
        let failedRevalidations: RevalidatePathErrorResult[] = [];
        let revalidationFailed = false;

        try {
            const res = await this.axiosInstance.post(
                `https://${baseUrl.hostname}/api/revalidate-all${
                    baseUrl.path != null ? `?basePath=${baseUrl.path}` : ""
                }`,
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
