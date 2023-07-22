import axios from "axios";

interface RevalidateResponse {
    revalidated: string[];
    failures: string[];
}

export async function revalidateUrl(url: string): Promise<void> {
    const response: RevalidateResponse = await axios.post(`${new URL(url).hostname}/api/revalidate`, {
        url,
    });
    if (response.failures.length > 0) {
        throw new Error(["Failed to revalidate paths:", ...response.failures.map((path) => `- ${path}`)].join("\n"));
    }
}
