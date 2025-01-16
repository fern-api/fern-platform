export function toOpenApiPath(path: string[]): string {
  return `#/${path
    .map((p) => p.replaceAll(/~/g, "~0").replaceAll(/\//g, "~1"))
    .join("/")}`;
}
