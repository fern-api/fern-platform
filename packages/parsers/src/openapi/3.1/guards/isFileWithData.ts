export function isFileWithData(
  valueObject: unknown
): valueObject is { filename: string; data: string } {
  return (
    typeof valueObject === "object" &&
    valueObject != null &&
    "filename" in valueObject &&
    "data" in valueObject &&
    typeof valueObject.filename === "string" &&
    typeof valueObject.data === "string"
  );
}
