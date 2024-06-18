import * as prettier from "prettier";
import { Snippet } from "./generated/api";

export async function formatSnippet(snippet: Snippet): Promise<Snippet> {
    switch (snippet.type) {
        case "typescript": {
            const client = await prettier.format(snippet.client, { tabWidth: 4, parser: "babel" });
            return {
                type: "typescript",
                ...snippet,
                client,
            };
        }
        default:
            return snippet;
    }
}
