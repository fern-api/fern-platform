import { FernRegistry } from "@fern-fern/fdr-cjs-sdk";
import parserBabel from "prettier/plugins/babel";
import * as prettierPluginEstree from "prettier/plugins/estree";
import * as prettier from "prettier/standalone";

export async function formatSnippet(snippet: FernRegistry.Snippet): Promise<FernRegistry.Snippet> {
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
