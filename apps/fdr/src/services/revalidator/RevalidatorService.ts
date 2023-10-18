import axios from "axios";
import * as AxiosLogger from "axios-logger";

export interface RevalidatorService {
    revalidateUrl({ url, docsConfigId }: { url: string; docsConfigId: string | undefined }): Promise<void>;
}

interface RevalidateResponse {
    revalidated: string[];
    failures: unknown[];
}

const AXIOS_INSTANCE = axios.create();

// @ts-expect-error See https://github.com/hg-pyun/axios-logger/issues/131
AXIOS_INSTANCE.interceptors.request.use(AxiosLogger.requestLogger);

export class RevalidatorServiceImpl implements RevalidatorService {
    public async revalidateUrl({
        url,
        docsConfigId,
    }: {
        url: string;
        docsConfigId: string | undefined;
    }): Promise<void> {
        const response = await AXIOS_INSTANCE.post(
            `${new URL(url).origin}/api/revalidate`,
            docsConfigId != null
                ? {
                      url,
                      docsConfigId,
                  }
                : { url },
        );
        const responseBody = response.data as RevalidateResponse;
        if (responseBody.failures.length > 0) {
            throw new Error(
                ["Failed to revalidate paths:", ...responseBody.failures.map((val) => `- ${JSON.stringify(val)}`)].join(
                    "\n",
                ),
            );
        }
    }
}
