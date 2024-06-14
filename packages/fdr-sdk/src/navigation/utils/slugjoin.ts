import urljoin from "url-join";

// normalizes slug parts and joins them with a single slash
export function slugjoin(...parts: string[]): string {
    return urljoin(parts.map((part) => part.trim()))
        .replaceAll("//*", "/")
        .replace(/^\//, "")
        .replace(/\/$/, "");
}
