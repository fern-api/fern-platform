export function unknownToString(value: unknown): string {
    if (typeof value === "string") {
        return value;
    }
    if (typeof value === "boolean") {
        return value ? "true" : "false";
    }
    if (typeof value === "number") {
        return value.toString();
    }
    if (value == null) {
        return "";
    }
    return JSON.stringify(value);
}
