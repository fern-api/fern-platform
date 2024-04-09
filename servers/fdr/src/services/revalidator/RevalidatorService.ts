import { FernRevalidation } from "@fern-fern/revalidation-sdk";
import axios, { type AxiosInstance } from "axios";
import * as AxiosLogger from "axios-logger";
import { FdrApplication } from "../../app";
import { ParsedBaseUrl } from "../../util/ParsedBaseUrl";
import { provideRevalidationClient } from "./provideRevalidationClient";

export type RevalidatedPathsResponse = {
    response?: FernRevalidation.BulkRevalidateResponse;
    revalidationFailed: boolean;
};

export interface RevalidatorService {
    revalidate(params: {
        // fernUrl: ParsedBaseUrl;
        baseUrl: ParsedBaseUrl;
        app: FdrApplication;
        oldSlugs?: string[];
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
     * As of ui@0.62.0 (https://github.com/fern-api/fern-platform/pull/572) basepath revalidation is directly supported. Example:
     * POST https://custom-domain.com/path/api/fern-docs/revalidate-all/v2 where `https://custom-domain.com/path` is the full environment URL.
     *
     * Since custom-domain.com is a rewrite to org.docs.buildwithfern.com, there's one caveat to keep in mind:
     *
     * Example prefetch request:
     * https://custom-domain.com/path/_next/data/.../static/custom-domain.com/path.json is rewritten to:
     * https://org.docs.buildwithfern.com/path/_next/data/.../static/custom-domain.com/path.json
     *
     * So `/static/custom-domain.com/path` is the path we need to revalidate on org.docs.buildwithfern.com
     */

    public async revalidate({
        // fernUrl,
        baseUrl,
        app,
        oldSlugs = [],
    }: {
        // fernUrl: ParsedBaseUrl;
        baseUrl: ParsedBaseUrl;
        app?: FdrApplication;
        oldSlugs?: string[];
    }): Promise<RevalidatedPathsResponse> {
        let revalidationFailed = false;
        try {
            const client = provideRevalidationClient(baseUrl);

            const newSlugs = await client.listSlugs({ xFernHost: baseUrl.hostname });

            // we need to revalidate all paths that have ever been generated, before and after docs registration:
            const slugs = Array.from(new Set([...oldSlugs, ...newSlugs]));
            const response = await client.bulkRevalidate({ host: baseUrl.hostname, slugs });

            return {
                response,
                revalidationFailed,
            };
        } catch (e) {
            app?.logger.error("Failed to revalidate paths", e);
            revalidationFailed = true;
            console.log(e);
            return {
                response: undefined,
                revalidationFailed,
            };
        }
    }
}
