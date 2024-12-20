export function isRecord(input: unknown): input is Record<string, unknown> {
<<<<<<< HEAD
    return typeof input === "object" && input != null && !Array.isArray(input);
=======
  return typeof input === "object" && input != null && !Array.isArray(input);
>>>>>>> main
}
