import { APIV1Read } from "@fern-api/fdr-sdk";
import { convertEndpointExampleToHttpRequestExample } from "../api-page/examples/HttpRequestExample";
import { stringifyHttpRequestExampleToCurl } from "../api-page/examples/stringifyHttpRequestExampleToCurl";
import { ResolvedCodeSnippet, ResolvedEndpointDefinition, ResolvedExampleEndpointRequest } from "./types";

export function resolveCodeSnippets(
    endpoint: ResolvedEndpointDefinition,
    example: APIV1Read.ExampleEndpointCall,
    requestBody: ResolvedExampleEndpointRequest | undefined,
    // highlighter: Highlighter,
): ResolvedCodeSnippet[] {
    let toRet: ResolvedCodeSnippet[] = [];

    const curlCode = stringifyHttpRequestExampleToCurl(
        convertEndpointExampleToHttpRequestExample(endpoint, example, requestBody),
    );

    toRet.push({
        name: undefined,
        language: "curl",
        install: undefined,
        code: curlCode,
        // hast: highlight(highlighter, curlCode, "bash"),
        generated: true,
    });

    if (example.codeExamples.pythonSdk != null) {
        toRet.push({
            name: undefined,
            language: "python",
            install: example.codeExamples.pythonSdk.install,
            code: example.codeExamples.pythonSdk.sync_client,
            // hast: highlight(highlighter, code, "python"),
            generated: true,
        });
    }

    if (example.codeExamples.typescriptSdk != null) {
        toRet.push({
            name: undefined,
            language: "typescript",
            install: example.codeExamples.typescriptSdk.install,
            code: example.codeExamples.typescriptSdk.client,
            // hast: highlight(highlighter, code, "typescript"),
            generated: true,
        });
    }

    if (example.codeExamples.goSdk != null) {
        toRet.push({
            name: undefined,
            language: "go",
            install: example.codeExamples.goSdk.install,
            code: example.codeExamples.goSdk.client,
            // hast: highlight(highlighter, code, "go"),
            generated: true,
        });
    }

    if (example.codeExamples.rubySdk != null) {
        toRet.push({
            name: undefined,
            language: "ruby",
            install: example.codeExamples.rubySdk.install,
            code: example.codeExamples.rubySdk.client,
            // hast: highlight(highlighter, code, "ruby"),
            generated: true,
        });
    }

    example.codeSamples.forEach((codeSample) => {
        const language = cleanLanguage(codeSample.language);
        // Remove any generated code snippets with the same language
        toRet = toRet.filter((snippet) => (snippet.generated ? snippet.language !== language : true));
        toRet.push({
            name: codeSample.name,
            language,
            install: codeSample.install,
            code: codeSample.code,
            // hast: highlight(highlighter, code, language),
            generated: false,
        });
    });

    return toRet;
}

function cleanLanguage(language: string): string {
    language = language.toLowerCase().trim();
    if (["node", "nodejs", "js", "javascript"].includes(language)) {
        return "javascript";
    }

    if (["py", "python"].includes(language)) {
        return "python";
    }

    if (["ts", "typescript", "ts-node"].includes(language)) {
        return "typescript";
    }

    if (["go", "golang"].includes(language)) {
        return "go";
    }

    return language;
}
