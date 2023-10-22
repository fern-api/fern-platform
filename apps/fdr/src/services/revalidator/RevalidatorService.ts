import { FernRegistry, PathResolver, joinUrlSlugs } from "@fern-api/fdr-sdk";
import axios, { type AxiosInstance } from "axios";
import * as AxiosLogger from "axios-logger";
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

type RevalidatePathResult = RevalidatePathSuccessResult | RevalidatePathErrorResult;

export type RevalidatedPaths = {
    success: RevalidatePathSuccessResult[];
    error: RevalidatePathErrorResult[];
};

export interface RevalidatorService {
    revalidatePaths(params: {
        definition: Pick<FernRegistry.docs.v1.read.DocsDefinition, "apis" | "config">;
        urls: ParsedBaseUrl[];
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

    public constructor() {
        this.axiosInstance = axios.create();
        // @ts-expect-error See https://github.com/hg-pyun/axios-logger/issues/131
        this.axiosInstance.interceptors.request.use(AxiosLogger.requestLogger);
    }

    public async revalidatePaths({
        definition,
        urls,
    }: {
        definition: FernRegistry.docs.v1.read.DocsDefinition;
        urls: ParsedBaseUrl[];
    }): Promise<RevalidatedPaths> {
        const resolver = new PathResolver({
            definition: {
                apis: definition.apis,
                docsConfig: definition.config,
            },
        });

        const slugs = resolver.getAllSlugs();

        const resultsArr = await Promise.all(
            urls.map(async (url) => {
                return await Promise.all(
                    slugs.map(async (slug) => {
                        const resp = await this.revalidatePath({ url, path: `/${slug}` });
                        return { ...resp, url: joinUrlSlugs(url.getFullUrl(), slug) };
                    }),
                );
            }),
        );

        return this.groupResults(resultsArr.flat(1));
    }

    private async revalidatePath({ url, path }: { url: ParsedBaseUrl; path: string }): Promise<ResponseBody> {
        try {
            const body: RequestBody = { path };
            const response = await this.axiosInstance.post<SuccessResponseBody>(
                `${url.getFullUrl()}/api/revalidate-v2`,
                body,
            );
            return { success: response.data.success };
        } catch (e) {
            const response = axios.isAxiosError(e) ? (e.response?.data as ErrorResponseBody | undefined) : undefined;
            const message = response?.message ?? "Unknown error.";
            return { success: false, message };
        }
    }

    private groupResults(results: RevalidatePathResult[]) {
        const groupedResults: RevalidatedPaths = {
            success: [],
            error: [],
        };
        results.forEach((r) => {
            if (r.success) {
                groupedResults.success.push(r);
            } else {
                groupedResults.error.push(r);
            }
        });
        return groupedResults;
    }
}
