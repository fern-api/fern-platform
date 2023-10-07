// TODO: Remove this. Doesn't pass the tests
export function joinUrlSlugs(...parts: [string, ...string[]]): string {
    return parts.reduce((a, b) => {
        if (a === "") {
            return b;
        }
        return `${a}/${b}`;
    });
}
