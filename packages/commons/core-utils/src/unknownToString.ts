interface Opts {
    renderNull?: boolean;
}

export function unknownToString(value: unknown, { renderNull = false }: Opts = {}): string {
    if (value == null || typeof value === "function") {
        return renderNull ? "null" : "";
    } else if (typeof value === "string") {
        return value;
    }
    return JSON.stringify(value);
}

export default unknownToString;
