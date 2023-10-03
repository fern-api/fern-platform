import { SnippetsService } from "../../api";
import { type FdrApplication } from "../../app";

export function getSnippetsService(_: FdrApplication): SnippetsService {
    return new SnippetsService({
        get: async () => {
            throw new Error("There are no snippets available for this API");
        },
        load: async () => {
            throw new Error("There are no snippets available for this API");
        },
    });
}
