import { removeTrailingSlash } from "next/dist/shared/lib/router/utils/remove-trailing-slash";
import { once } from "./once";

function isTruthy(value: string | undefined) {
    return value != null && ["true", "1"].includes(value.trim().toLowerCase());
}

export const isTrailingSlashEnabled = once((): boolean => {
    return isTruthy(process.env.TRAILING_SLASH);
});

const addTrailingSlash = (pathname: string): string => {
    return pathname.endsWith("/") ? pathname : `${pathname}/`;
};

export function conformTrailingSlash(pathname: string): string {
    return isTrailingSlashEnabled()
        ? addTrailingSlash(pathname)
        : removeTrailingSlash(pathname);
}
