export function accessByPath(object: unknown, path: string[] | string): unknown {
    try {
        let res = object;
        const indices = typeof path === "string" ? splitPath(path) : path;
        for (const idx of indices) {
            if (res == null) {
                return undefined;
            }
            if (Array.isArray(res) || res instanceof Array) {
                res = res[0];
            } else {
                res = (res as any)[idx];
            }
        }
        return res;
    } catch (err) {
        // if an error is thrown just return undefined
    }
    return undefined;
}

function splitPath(path: string): string[] {
    const result: string[] = [];
    for (const part of path.split(".")) {
        // Use regex to find parts within brackets
        let matches = part.match(/([^\[\]]+)|(\d+)/g);
        if (matches) {
            result.push(...matches);
        } else {
            result.push(part);
        }
    }
    return result;
}
