export function writeBuffer(val: unknown): Buffer {
    return Buffer.from(JSON.stringify(val), "utf-8");
}

export function readBuffer(val: Buffer): unknown {
    return JSON.parse(val.toString());
}
