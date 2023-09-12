import { snakeCase } from "lodash-es";

export function getAnchorId(anchorIdParts: string[]): string {
    return anchorIdParts.map((anchorId) => snakeCase(anchorId)).join("-");
}
