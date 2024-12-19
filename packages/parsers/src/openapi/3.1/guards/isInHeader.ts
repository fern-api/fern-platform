export function isInHeader(input: unknown): input is {
    in: "header";
} {
    return (
        typeof input === "object" &&
        input != null &&
        "in" in input &&
        input.in === "header"
    );
}
