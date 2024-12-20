export function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input != null && !Array.isArray(input);
}
