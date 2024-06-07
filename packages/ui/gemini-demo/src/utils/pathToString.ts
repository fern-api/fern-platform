import { APIV1Read } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "./visitDiscriminatedUnion";

export function pathToString(path: APIV1Read.EndpointPath): string {
    const parts = path.parts.map((part) => visitDiscriminatedUnion(part)._visit({
        literal: part => part.value,
        pathParameter: part => `:${part.value}`,
    }));

    return parts.join("");
}