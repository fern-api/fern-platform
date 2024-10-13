/**
 * @param lines markdown.split("/n")
 * @param position position in the markdown node
 * @returns start and length of the text to extract from the original markdown
 */
export function getPosition(
    lines: readonly string[],
    position: { start: { line: number; column: number }; end: { line: number; column: number } },
): { start: number; length: number } {
    let start = position.start.column - 1;
    for (let i = 0; i < position.start.line - 1; i++) {
        const line = lines[i];
        if (line == null) {
            break;
        }
        start += line.length + 1;
    }

    let length = 0 - position.start.column + position.end.column;

    for (let i = position.start.line - 1; i < position.end.line - 1; i++) {
        const line = lines[i];
        if (line == null) {
            break;
        }
        length += line.length + 1;
    }

    return { start, length };
}
