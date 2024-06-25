import parserBabel from "prettier/plugins/babel";
import * as prettierPluginEstree from "prettier/plugins/estree";
import * as prettier from "prettier/standalone";
import { Snippet } from "./generated/api";

export async function formatSnippet(snippet: Snippet): Promise<Snippet> {
    switch (snippet.type) {
        case "typescript": {
            const client = await prettier.format(snippet.client, {
                tabWidth: 4,
                parser: "babel",
                plugins: [parserBabel, prettierPluginEstree],
            });
            return {
                ...snippet,
                client,
            };
        }
        default:
            return snippet;
    }
}
