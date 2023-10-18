import { type FullSlug } from "@fern-api/fdr-sdk";
import { SerializedMdxContent } from "@fern-ui/app-utils";

type Results = Record<FullSlug, SerializedMdxContent | null>;

interface SuccessResponse {
    success: true;
    results: Results;
}

interface ErrorResponse {
    success: false;
    message: string;
}

type Response = SuccessResponse | ErrorResponse;

/**
 * Sends a request to the API route to serialize mdx for a list of page nodes. If the provided slug
 * does not correspond to a page, the received response for that slug will be null.
 *
 */
export async function fetchSerializedMdxContentForSlugs(fullSlugs: FullSlug[]): Promise<Results> {
    type RequestBody = { fullSlugs: string[] };
    const body: RequestBody = { fullSlugs };
    const resp = await fetch("/api/serialize-mdx", {
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(body),
    });
    const responseJson = (await resp.json()) as Response;
    if (!responseJson.success) {
        throw new Error(responseJson.message);
    }
    return responseJson.results;
}
