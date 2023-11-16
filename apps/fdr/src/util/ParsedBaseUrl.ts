const HAS_HTTPS_REGEX = /^https?:\/\//i;

export class ParsedBaseUrl {
    public readonly hostname: string;
    public readonly path: string | undefined;

    private constructor({ hostname, path }: { hostname: string; path: string | undefined }) {
        this.hostname = hostname;
        this.path = path;
    }

    public getFullUrl(): string {
        if (this.path == null) {
            return `${this.hostname}`;
        }
        return `${this.hostname}${this.path}`;
    }

    public toURL(): URL {
        return new URL(`https://${this.getFullUrl()}`);
    }

    public static parse(url: string): ParsedBaseUrl {
        let urlWithHttpsPrefix = url;
        if (!HAS_HTTPS_REGEX.test(url)) {
            urlWithHttpsPrefix = "https://" + url;
        }
        const parsedURL = new URL(urlWithHttpsPrefix);
        return new ParsedBaseUrl({
            hostname: parsedURL.hostname,
            path: parsedURL.pathname === "/" ? undefined : parsedURL.pathname,
        });
    }
}
