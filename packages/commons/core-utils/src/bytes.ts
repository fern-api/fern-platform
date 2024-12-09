export function measureBytes(str: string): number {
    return new TextEncoder().encode(str).length;
}

/**
 * Chunks a string into an array of strings, each of the specified byte size.
 * @param str - The string to chunk.
 * @param byteSize - The byte size of each chunk. i.e. 10KB = 50 * 1000
 * @returns An array of strings, each of the specified byte size.
 */
export function chunkToBytes(str: string, byteSize: number): string[] {
    const encoder = new TextEncoder();

    // TODO: what if the string isn't utf8?
    const utf8Bytes = encoder.encode(str);
    const numChunks = Math.ceil(utf8Bytes.length / byteSize);
    const chunks = new Array(numChunks);

    for (let i = 0, o = 0; i < numChunks; ++i, o += byteSize) {
        chunks[i] = new TextDecoder().decode(utf8Bytes.slice(o, o + byteSize));
    }

    return chunks;
}

/**
 * Truncates a string to the specified byte length.
 * @param str - The string to truncate.
 * @param byteSize - The byte size of the truncated string. i.e. 10KB = 50 * 1000
 * @returns The truncated string.
 */
export function truncateToBytes(str: string, byteSize: number): string {
    const encoder = new TextEncoder();
    const utf8Bytes = encoder.encode(str);
    const truncatedBytes = utf8Bytes.slice(0, byteSize);
    return new TextDecoder().decode(truncatedBytes);
}
