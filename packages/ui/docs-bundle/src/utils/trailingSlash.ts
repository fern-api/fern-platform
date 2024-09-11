import { once } from "./once";

function isTruthy(value: string | undefined) {
    return value != null && ["true", "1"].includes(value.trim().toLowerCase());
}

export const isTrailingSlashEnabled = once((): boolean => {
    return isTruthy(process.env.TRAILING_SLASH);
});

export function conformTrailingSlash(pathname: string): string {
    if (isTrailingSlashEnabled()) {
        return pathname.endsWith("/") ? pathname : `${pathname}/`;
    } else {
        return pathname.replace(/\/$/, "");
    }
}
