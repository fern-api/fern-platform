import type { Point, Position } from "unist";

/**
 * @param lines markdown.split("/n")
 * @param position position in the markdown node
 * @returns start and length of the text to extract from the original markdown
 */
export function getPosition(lines: readonly string[], position: Position): { start: number; length: number } {
    const start = getStart(lines, position);
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

export function isPosition(value: unknown): value is Position {
    return typeof value === "object" && value != null && "start" in value && "end" in value;
}

export function isPoint(value: unknown): value is Point {
    return typeof value === "object" && value != null && "line" in value && "column" in value;
}

export function getStart(lines: readonly string[], place: Position | Point): number {
    const point = isPoint(place) ? place : place.start;

    let start = point.column - 1;
    for (let i = 0; i < point.line - 1; i++) {
        const line = lines[i];
        if (line == null) {
            break;
        }
        start += line.length + 1;
    }

    return start;
}
