import { kebabCase } from "es-toolkit/string";

export function getEndpointId(method: string, path: string): string {
    return kebabCase(`${method}-${path.replace(/\//g, "-")}`);
}
