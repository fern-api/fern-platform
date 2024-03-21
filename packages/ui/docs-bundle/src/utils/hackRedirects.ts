interface Redirect {
    from: string;
    to: string;
}

const HUME_REDIRECTS: Redirect[] = [
    {
        from: "/streaming-api-tutorial",
        to: "/docs/expression-measurement-api/websocket",
    },
    {
        from: "/docs/support",
        to: "/support",
    },
    {
        from: "/streaming-api-error-codes",
        to: "/docs/resources/errors",
    },
];

function getRedirects(domain: string): Redirect[] {
    if (domain.includes("hume")) {
        return HUME_REDIRECTS;
    }

    return [];
}

export function getRedirectForPath(domain: string, path: string): Redirect | undefined {
    return getRedirects(domain).find((redirect) => redirect.from === path);
}
