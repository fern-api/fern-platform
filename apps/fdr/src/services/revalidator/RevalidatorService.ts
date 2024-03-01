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

export type RevalidatedPaths = {
    successfulRevalidations: RevalidatePathSuccessResult[];
    failedRevalidations: RevalidatePathErrorResult[];
};

export interface RevalidatorService {
    revalidate(params: { baseUrl: ParsedBaseUrl }): Promise<RevalidatedPaths>;
}

// interface RequestBody {
//     path: string;
// }

// type ResponseBody = SuccessResponseBody | ErrorResponseBody;

// interface SuccessResponseBody {
//     success: true;
// }

// interface ErrorResponseBody {
//     success: false;
//     message: string;
// }

export class RevalidatorServiceImpl implements RevalidatorService {
    public readonly axiosInstance: AxiosInstance;
    // private readonly semaphore = new Semaphore(50);

    public constructor() {
        this.axiosInstance = axios.create();
        // @ts-expect-error See https://github.com/hg-pyun/axios-logger/issues/131
        this.axiosInstance.interceptors.request.use(AxiosLogger.requestLogger);
    }

    public async revalidate({ baseUrl }: { baseUrl: ParsedBaseUrl }): Promise<RevalidatedPaths> {
        const successfulRevalidations: RevalidatePathSuccessResult[] = [];
        const failedRevalidations: RevalidatePathErrorResult[] = [];

        try {
            await this.axiosInstance.post(
                `https://${baseUrl.getFullUrl()}/api/revalidate-all${
                    baseUrl.path != null ? `?basePath=${baseUrl.path}` : ""
                }`,
            );
        } catch (e) {
            // TODO: the server should return a list of paths that succeeded or failed to revalidate
        }

        return {
            failedRevalidations,
            successfulRevalidations,
        };
    }

    // private async revalidatePath({ baseUrl, path }: { baseUrl: ParsedBaseUrl; path: string }): Promise<ResponseBody> {
    //     await this.semaphore.acquire();
    //     try {
    //         const body: RequestBody = { path };
    //         const response = await this.axiosInstance.post<SuccessResponseBody>(
    //             `https://${baseUrl.getFullUrl()}/api/revalidate-v2`,
    //             body,
    //         );
    //         this.semaphore.release();
    //         return { success: response.data.success };
    //     } catch (e) {
    //         this.semaphore.release();
    //         const response = axios.isAxiosError(e) ? (e.response?.data as ErrorResponseBody | undefined) : undefined;
    //         const message = response?.message ?? "Unknown error.";
    //         return { success: false, message };
    //     }
    // }
}
