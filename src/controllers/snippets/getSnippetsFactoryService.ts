import { SnippetsFactoryService } from "../../api";
import { type FdrApplication } from "../../app";

export function getSnippetsFactoryService(_: FdrApplication): SnippetsFactoryService {
    return new SnippetsFactoryService({
        createSnippetsForSdk: async () => {
            throw new Error("Unimplemented");
        },
    });
}
