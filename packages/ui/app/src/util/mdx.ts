import { FullSlug, SerializedMdxContent } from "@fern-ui/app-utils";

type Result = Record<FullSlug, SerializedMdxContent | null>;

/**
 * Sends a request to the API route to serialize mdx for a list of page nodes. If the provided slug
 * does not correspond to a page, the received response for that slug will be null.
 *
 */
export async function fetchSerializedMdxContentForSlugs(fullSlugs: FullSlug[]): Promise<Result> {
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
    return (await resp.json()) as Result;
}
