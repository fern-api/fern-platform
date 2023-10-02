import { SnippetsFactoryService } from "../../api";

export function getSnippetsFactoryService(): SnippetsFactoryService {
    return new SnippetsFactoryService({
        createSnippetsForSdk: async () => {
            throw new Error("Unimplimented");
        },
    });
}
