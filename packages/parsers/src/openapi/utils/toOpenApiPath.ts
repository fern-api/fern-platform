export function toOpenApiPath(path: string[]): string {
    return `#/${path.join("/")}`;
}
