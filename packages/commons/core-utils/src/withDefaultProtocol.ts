/**
 * Prefixes the given endpoint with the `defaultProtocol` if one isn't defined already.
 *
 * @param endpoint
 * @param defaultProtocol defaults to "https://"
 * @returns the endpoint, which will always have a protocol
 */
export function withDefaultProtocol(endpoint: string, defaultProtocol = "https://"): string {
    // matches any protocol scheme at the beginning of the string (e.g., "http://", "https://", "ftp://")
    const protocolRegex = /^[a-z]+:\/\//i;

    if (!protocolRegex.test(endpoint)) {
        if (endpoint === "localhost" || endpoint.startsWith("localhost:")) {
            return `http://${endpoint}`;
        }

        return `${defaultProtocol}${endpoint}`;
    }

    return endpoint;
}
