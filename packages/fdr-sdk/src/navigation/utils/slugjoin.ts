import urljoin from "url-join";
import { FernNavigation } from "../generated";

// normalizes slug parts and joins them with a single slash
export function slugjoin(...parts: string[]): FernNavigation.Slug {
    return FernNavigation.Slug(
        urljoin(parts.map((part) => part.trim()))
            .replaceAll("//*", "/")
            .replace(/^\//, "")
            .replace(/\/$/, ""),
    );
}
