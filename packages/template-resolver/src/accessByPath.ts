export function accessByPath(
    object: unknown,
    path: string[] | string
): unknown {
    try {
        let res = object;
        const indices = typeof path === "string" ? splitPath(path) : path;
        for (const idx of indices) {
            if (res == null) {
                return undefined;
            }
            if (
                (Array.isArray(res) || res instanceof Array) &&
                !isNaN(Number(idx))
            ) {
                res = res[Number(idx)];
            } else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                res = (res as any)[idx];
            }
        }
        return res;
    } catch (err) {
        // if an error is thrown just return undefined
    }
    return undefined;
}

export function accessByPathNonNull(
    jsonObject: unknown,
    path?: string | string[]
): unknown {
    if (path != null && jsonObject != null && path.length > 0) {
        return accessByPath(jsonObject, path);
    }
    return jsonObject;
}

/**
 *
 * @param path a path like `a.b.c[0].d
 * @returns ['a', 'b', 'c', '0', 'd']
 */
function splitPath(path: string): string[] {
    const result: string[] = [];
    for (const part of path.split(".")) {
        // Use regex to find parts within brackets
        const matches = part.match(/([^[\]]+)|(\d+)/g);
        if (matches) {
            result.push(...matches);
        } else {
            result.push(part);
        }
    }
    return result;
}
