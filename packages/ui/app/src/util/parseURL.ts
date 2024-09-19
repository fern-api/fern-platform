export function parseURL(baseUrl: string): URL;
export function parseURL(baseUrl: string | undefined): URL | undefined;
export function parseURL(baseUrl: string | undefined): URL | undefined {
    if (!baseUrl) {
        return undefined;
    }

    // `https://-n` is a special case to avoid throwing an error when the URL is invalid
    return new URL(new URL(baseUrl, "https://-n").toString().replace(/^https:\/\/-n\//, "https://"));
}
