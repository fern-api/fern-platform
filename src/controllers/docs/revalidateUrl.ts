import axios from "axios";
import * as AxiosLogger from "axios-logger";

interface RevalidateResponse {
    revalidated: string[];
    failures: unknown[];
}

const AXIOS_INSTANCE = axios.create();
AXIOS_INSTANCE.interceptors.request.use(AxiosLogger.requestLogger);

export async function revalidateUrl(url: string): Promise<void> {
    const response = await AXIOS_INSTANCE.post(`${new URL(url).origin}/api/revalidate`, {
        url,
    });
    const responseBody = response.data as RevalidateResponse;
    if (responseBody.failures.length > 0) {
        throw new Error(
            ["Failed to revalidate paths:", ...responseBody.failures.map((val) => `- ${JSON.stringify(val)}`)].join(
                "\n"
            )
        );
    }
}
