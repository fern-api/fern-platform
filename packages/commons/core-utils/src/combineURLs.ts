/**
 * Creates a new URL by combining the specified URLs
 *
 * From [Axios' combineURLs](https://github.com/axios/axios/blob/c8b7be59cba56e8fd09dc667de246117987d7517/lib/helpers/combineURLs.js)
 *
 * @param baseURL The base URL
 * @param relativeURL The relative URL
 *
 * @returns The combined URL
 */
export function combineURLs(baseURL: string, relativeURL: string): string {
    return relativeURL
        ? baseURL.replace(/\/?\/$/, "") + "/" + relativeURL.replace(/^\/+/, "")
        : baseURL;
}
