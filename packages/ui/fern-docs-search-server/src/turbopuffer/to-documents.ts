import { uniqBy, zipWith } from "es-toolkit/array";
import { FernTurbopufferRecord } from "./types";

export function toDocuments(results: FernTurbopufferRecord[]): string[] {
    return uniqBy(
        results.map((result) => {
            const code_snippets = zipWith(
                result.attributes.code_snippets ?? [],
                result.attributes.code_snippet_langs ?? [],
                (snippet, lang) => {
                    const lang_str: string = lang ?? "";
                    return `\`\`\`${lang_str}\n${snippet}\n\`\`\``;
                },
            ).join("\n\n");
            return {
                canonicalPathname: result.attributes.canonicalPathname,
                domain: result.attributes.domain,
                pathname: result.attributes.pathname,
                hash: result.attributes.hash,
                title: result.attributes.title,
                description: result.attributes.description ? result.attributes.description + "\n\n" : "",
                content: result.attributes.content ? result.attributes.content + "\n\n" : "",
                code_snippets: code_snippets ? code_snippets + "\n\n" : "",
                page_position: result.attributes.page_position,
            };
        }),
        (result) => `${result.pathname}${result.hash} - ${result.page_position}`,
    ).map(
        (result) =>
            `# ${result.title}\n Source: ${result.domain}${result.pathname}${result.hash ?? ""}\n\n${result.description}${result.content}${result.code_snippets}`,
    );
}
