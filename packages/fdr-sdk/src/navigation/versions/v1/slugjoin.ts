import urljoin from "url-join";
import { Slug } from ".";

// normalizes slug parts and joins them with a single slash
export function slugjoin(...parts: string[]): Slug {
    return Slug(
        urljoin(parts.map((part) => part.trim()))
            .replaceAll("//*", "/")
            .replace(/^\//, "")
            .replace(/\/$/, "")
    );
}
