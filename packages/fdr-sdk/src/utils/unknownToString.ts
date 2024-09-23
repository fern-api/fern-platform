export function unknownToString(value: unknown): string {
    if (typeof value === "string") {
        return value;
    } else if (typeof value === "boolean" || typeof value === "number") {
        return value.toString();
    } else if (value == null) {
        return "null";
    }
    return JSON.stringify(value);
}
