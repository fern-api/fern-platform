import { SnippetsService } from "../../api";

export function getSnippetsService(): SnippetsService {
    return new SnippetsService({
        get: async () => {
            throw new Error("There are no snippets available for this API");
        },
        load: async () => {
            throw new Error("There are no snippets available for this API");
        },
    });
}
