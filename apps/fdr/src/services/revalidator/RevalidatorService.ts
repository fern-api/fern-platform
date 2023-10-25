import { FernRegistry, PathResolver } from "@fern-api/fdr-sdk";
import axios, { type AxiosInstance } from "axios";
import * as AxiosLogger from "axios-logger";
import { ParsedBaseUrl } from "../../util/ParsedBaseUrl";
import { Semaphore } from "./Semaphore";

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
};

export interface RevalidatorService {
    revalidate(params: {
        definition: Pick<FernRegistry.docs.v1.read.DocsDefinition, "apis" | "config">;
        baseUrl: ParsedBaseUrl;
    }): Promise<RevalidatedPaths>;
}

interface RequestBody {
    path: string;
}

type ResponseBody = SuccessResponseBody | ErrorResponseBody;

interface SuccessResponseBody {
    success: true;
}

interface ErrorResponseBody {
    success: false;
    message: string;
}

export class RevalidatorServiceImpl implements RevalidatorService {
    public readonly axiosInstance: AxiosInstance;
    private readonly semaphore = new Semaphore(50);

    public constructor() {
        this.axiosInstance = axios.create();
        // @ts-expect-error See https://github.com/hg-pyun/axios-logger/issues/131
        this.axiosInstance.interceptors.request.use(AxiosLogger.requestLogger);
    }

    public async revalidate({
        definition,
        baseUrl,
    }: {
        definition: FernRegistry.docs.v1.read.DocsDefinition;
        baseUrl: ParsedBaseUrl;
    }): Promise<RevalidatedPaths> {
        const resolver = new PathResolver({
            definition: {
                apis: definition.apis,
                docsConfig: definition.config,
            },
        });

        const successfulRevalidations: RevalidatePathSuccessResult[] = [];
        const failedRevalidations: RevalidatePathErrorResult[] = [];

        const slugs = resolver.getAllSlugs();
        await Promise.all(
            slugs.map(async (slug) => {
                const response = await this.revalidatePath({ baseUrl, path: `/${slug}` });
                if (response.success) {
                    successfulRevalidations.push({
                        success: true,
                        url: `/${slug}`,
                    });
                } else {
                    failedRevalidations.push({
                        success: false,
                        url: `/${slug}`,
                        message: response.message,
                    });
                }
            }),
        );

        return {
            failedRevalidations,
            successfulRevalidations,
        };
    }

    private async revalidatePath({ baseUrl, path }: { baseUrl: ParsedBaseUrl; path: string }): Promise<ResponseBody> {
        await this.semaphore.acquire();
        try {
            const body: RequestBody = { path };
            const response = await this.axiosInstance.post<SuccessResponseBody>(
                `https://${baseUrl.getFullUrl()}/api/revalidate-v2`,
                body,
            );
            return { success: response.data.success };
        } catch (e) {
            const response = axios.isAxiosError(e) ? (e.response?.data as ErrorResponseBody | undefined) : undefined;
            const message = response?.message ?? "Unknown error.";
            return { success: false, message };
        }
    }
}
