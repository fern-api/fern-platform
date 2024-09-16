export function isNonNullish<T>(x: T | null | undefined): x is T {
    return x != null;
}

export function assertNonNullish<T>(x: T | null | undefined, message?: string): asserts x is T {
    if (x == null) {
        throw new Error(message ?? "Value is null or undefined");
    }
}
