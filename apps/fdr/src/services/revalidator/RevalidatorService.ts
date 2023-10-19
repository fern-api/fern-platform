import { FernRegistry, PathResolver, joinUrlSlugs } from "@fern-api/fdr-sdk";
import axios, { type AxiosInstance } from "axios";
import * as AxiosLogger from "axios-logger";

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
        domains: string[];
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
        domains: domainsInShortForm,
    }: {
        definition: FernRegistry.docs.v1.read.DocsDefinition;
        domains: string[];
    }): Promise<RevalidatedPaths> {
        const domains = domainsInShortForm.map((domain) => `https://${domain}`);

        const resolver = new PathResolver({
            definition: {
                apis: definition.apis,
                docsConfig: definition.config,
            },
        });

        const slugs = resolver.getAllSlugs();

        const resultsArr = await Promise.all(
            domains.map(async (domain) => {
                const urls = slugs.map((slug) => joinUrlSlugs(domain, slug));
                return await Promise.all(
                    urls.map(async (url) => {
                        const resp = await this.revalidatePath(url);
                        return { ...resp, url };
                    }),
                );
            }),
        );

        return this.groupResults(resultsArr.flat(1));
    }

    private async revalidatePath(url: string): Promise<ResponseBody> {
        try {
            const body: RequestBody = { path: url };
            const response = await this.axiosInstance.post<SuccessResponseBody>(
                `${new URL(url).origin}/api/revalidate-v2`,
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
