import { APIV1Read, APIV1UI } from "../../client";
import { unknownToString } from "../../utils/unknownToString";
import { toHttpRequest } from "./HttpRequest";
import { convertToCurl } from "./curl";

interface Flags {
    /**
     * If true, rename the language "typescript" to "javascript" in the code snippets.
     * This works for now because the TypeScript SDK snippets don't use TypeScript-specific features.
     * But if they do in the future, we'll need to generate separate TypeScript and JavaScript snippets.
     */
    useJavaScriptAsTypeScript: boolean;

    /**
     * If true, avoid generating Typescript SDK snippets.
     * In @fern-ui/ui's resolver, we generate http-snippets for JavaScript.
     */
    alwaysEnableJavaScriptFetch: boolean;

    /**
     * If true, the generated form data snippet will always include the `application/json` content type.
     */
    usesApplicationJsonInFormDataValue: boolean;
}

/**
 * Note that the HTTP EndpointDefinition is the only definition type (as of ~2023) that comes with code snippets.
 *
 * FDR generates code snippets via snippet templates, but also accepts user-provided code snippets.
 * If the user provides a code snippet for a given language, it will be used in lieu of the generated code snippet.
 */
export function resolveCodeSnippets(
    endpoint: APIV1UI.EndpointDefinition,
    example: APIV1Read.ExampleEndpointCall,
    auth: APIV1Read.ApiAuth | undefined,
    flags: Flags,
): APIV1UI.CodeSnippet[] {
    const toRet: APIV1UI.CodeSnippet[] = [];

    const userProvidedLanguages = new Set<string>();

    // Add user-provided code snippets
    example.codeSamples.forEach((codeSample) => {
        const language = cleanLanguage(codeSample.language);
        userProvidedLanguages.add(language);

        toRet.push({
            name: codeSample.name,
            language,
            install: codeSample.install,
            code: codeSample.code,
            generated: false,
        });
    });

    if (!userProvidedLanguages.has("curl")) {
        const curlCode = convertToCurl(toHttpRequest(endpoint, example, auth), flags);
        toRet.push({
            name: undefined,
            language: "curl",
            install: undefined,
            code: unknownToString(curlCode),
            generated: true,
        });
    }

    if (!userProvidedLanguages.has("python") && example.codeExamples.pythonSdk != null) {
        toRet.push({
            name: undefined,
            language: "python",
            install: example.codeExamples.pythonSdk.install,
            code: example.codeExamples.pythonSdk.sync_client,
            generated: true,
        });
    }

    const jsLang = flags.useJavaScriptAsTypeScript ? "javascript" : "typescript";
    const jsLangName = flags.useJavaScriptAsTypeScript ? "JavaScript" : "TypeScript";
    if (
        !flags.alwaysEnableJavaScriptFetch &&
        !userProvidedLanguages.has(jsLang) &&
        example.codeExamples.typescriptSdk != null
    ) {
        toRet.push({
            name: `${jsLangName} SDK`,
            language: jsLang,
            install: example.codeExamples.typescriptSdk.install,
            code: example.codeExamples.typescriptSdk.client,
            generated: true,
        });
    }

    if (!userProvidedLanguages.has("go") && example.codeExamples.goSdk != null) {
        toRet.push({
            name: undefined,
            language: "go",
            install: example.codeExamples.goSdk.install,
            code: example.codeExamples.goSdk.client,
            generated: true,
        });
    }

    if (!userProvidedLanguages.has("ruby") && example.codeExamples.rubySdk != null) {
        toRet.push({
            name: undefined,
            language: "ruby",
            install: example.codeExamples.rubySdk.install,
            code: example.codeExamples.rubySdk.client,
            generated: true,
        });
    }

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
