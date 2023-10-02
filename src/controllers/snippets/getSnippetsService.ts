import { SnippetsService } from "../../api";

export function getSnippetsService(): SnippetsService {
    return new SnippetsService({
        get: async () => {
            throw new Error("Unimplimented");
        },
        load: async () => {
            throw new Error("Unimplimented");
        },
    });
}
