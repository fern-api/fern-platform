export function isRequired(object: object): boolean {
  return "required" in object && typeof object.required === "boolean"
    ? object.required
    : false;
}
