import { SnippetsService } from "../../api";
import type { FdrApplication } from "../../app";

export function getSnippetsService(_: FdrApplication): SnippetsService {
    return new SnippetsService({
        get: async () => {
            // TODO: Implement me!
            return;
        },
        load: async () => {
            // TODO: Implement me!
            return;
        },
    });
}