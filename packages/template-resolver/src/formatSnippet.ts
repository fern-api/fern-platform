import init, { format } from "@wasm-fmt/ruff_fmt";
import * as prettier from "prettier";
import { Snippet } from "./generated/api";

export async function formatSnippet(snippet: Snippet): Promise<Snippet> {
    switch (snippet.type) {
        case "typescript": {
            const client = await prettier.format(snippet.client, { tabWidth: 4, parser: "babel" });
            return {
                ...snippet,
                client,
            };
        }
        case "python": {
            await init();
            return {
                ...snippet,
                sync_client: format(snippet.sync_client),
                async_client: format(snippet.async_client),
            };
        }
        default:
            return snippet;
    }
}
