let jq: Awaited<typeof import("jsonpath")>;

/**
 * This is a workaround to lazily import the jsonpath library, but also ensure that the lazy loading doesn't happen multiple times.
 */
export async function lazyjsonpath(): Promise<Awaited<typeof import("jsonpath")>> {
    if (!jq) {
        jq = (await import("jsonpath")).default;
    }
    return jq;
}
