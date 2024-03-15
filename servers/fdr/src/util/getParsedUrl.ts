const HAS_HTTPS_REGEX = /^https?:\/\//i;

export function getParsedUrl(domain: string): URL {
    if (!HAS_HTTPS_REGEX.test(domain)) {
        domain = "https://" + domain;
    }
    return new URL(domain);
}
