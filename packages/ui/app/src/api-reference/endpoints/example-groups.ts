import { ApiDefinition } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { isEqual } from "es-toolkit";
import { sortBy } from "es-toolkit/array";
import { CodeExample } from "../examples/code-example";
import {
    ExamplesByKeyAndStatusCode,
    ExamplesByLanguageKeyAndStatusCode,
    ExamplesByStatusCode,
    SelectedExampleKey,
} from "../types/EndpointContent";

/**
 * Group examples by language, title, and status code.
 *
 * @param endpoint - The endpoint to group examples for.
 * @returns An object where the keys are the language, exampleId, and statusCode, and the value is an array of code examples.
 */
export function groupExamplesByLanguageKeyAndStatusCode(
    endpoint: ApiDefinition.EndpointDefinition,
): ExamplesByLanguageKeyAndStatusCode {
    const toRet: ExamplesByLanguageKeyAndStatusCode = {};

    function addCodeExample(
        key: { language: string; exampleKey: string; statusCode: number },
        codeExample: CodeExample,
    ): void {
        const existing = (((toRet[key.language] ??= {})[key.exampleKey] ??= {})[key.statusCode] ??= []);
        if (existing.some((e) => isEqual(e.exampleCall.responseBody, codeExample.exampleCall.responseBody))) {
            return;
        }
        existing.push(codeExample);
    }

    endpoint.examples?.forEach((example, i) => {
        if (example.snippets == null) {
            return;
        }

        Object.entries(example.snippets).forEach(([language, snippets]) => {
            snippets.forEach((snippet, j) => {
                const statusCode = example.responseStatusCode;

                const exampleKey = snippet.code;

                const codeExample: CodeExample = {
                    key: `${language}-${i},${j}`,
                    exampleIndex: i,
                    snippetIndex: j,
                    exampleKey,
                    language,
                    name: snippet.name ?? example.name,
                    code: snippet.code,
                    install: snippet.install,
                    exampleCall: example,
                };
                addCodeExample({ language, exampleKey, statusCode }, codeExample);

                endpoint.errors?.forEach((error, k) => {
                    error.examples?.forEach((errorExample, l) => {
                        const codeExample: CodeExample = {
                            key: `${language}-${i},${j},${k},${l}`,
                            exampleIndex: i,
                            snippetIndex: j,
                            exampleKey,
                            language,
                            name: snippet.name ?? example.name,
                            code: snippet.code,
                            install: snippet.install,
                            // HACK: this is a bit of a hack to append the global error to every example
                            exampleCall: {
                                ...example,
                                responseStatusCode: error.statusCode,
                                responseBody: errorExample.responseBody,
                                name: errorExample.name ?? error.name,
                            },
                            globalError: true,
                        };
                        addCodeExample({ language, exampleKey, statusCode: error.statusCode }, codeExample);
                    });
                });
            });
        });
    });

    return toRet;
}

/**
 * Get the available languages for a given endpoint.
 *
 * @param examples - The examples to get the available languages for.
 * @param defaultLanguage - The default language to promote to the top of the list.
 * @returns The available languages for the given endpoint in the order they should be displayed.
 */
export function getAvailableLanguages(examples: ExamplesByLanguageKeyAndStatusCode, defaultLanguage: string): string[] {
    return sortBy(
        Object.keys(examples).map((l) => ({ language: l })),
        [
            // promote the default language to the top of the list, otherwise promote curl
            (l) => (examples[defaultLanguage] != null ? l.language !== defaultLanguage : l.language !== "curl"),
            // sort the rest alphabetically
            (l) => l.language,
        ],
    ).map((l) => l.language);
}

interface SelectExampleToRenderResponse {
    selectedExampleKey: SelectedExampleKey;
    selectedExample: CodeExample | undefined;
    examplesByStatusCode: ExamplesByStatusCode;
    examplesByKeyAndStatusCode: ExamplesByKeyAndStatusCode;
}

/**
 * Select the example to render for a given key.
 *
 * @param examplesByLanguageKeyAndStatusCode - The examples to select the example to render for.
 * @param key - The key to select the example to render for.
 * @param defaultLanguage - The default language to use if the selected language is not found.
 * @returns The selected example to render + additional metadata about the selected example.
 */
export function selectExampleToRender(
    examplesByLanguageKeyAndStatusCode: ExamplesByLanguageKeyAndStatusCode,
    key: SelectedExampleKey,
    defaultLanguage: string,
): SelectExampleToRenderResponse {
    const { language, exampleKey, statusCode, responseIndex } = key;

    // prefer the selected language, otherwise pick the first available language
    const examplesByKeyAndStatusCode =
        examplesByLanguageKeyAndStatusCode[language] ??
        examplesByLanguageKeyAndStatusCode[
            getAvailableLanguages(examplesByLanguageKeyAndStatusCode, defaultLanguage)[0] ?? ""
        ] ??
        {};

    // prefer the selected exampleId, otherwise pick the first available exampleId
    const examplesByStatusCode =
        examplesByKeyAndStatusCode[exampleKey ?? ""] ??
        examplesByKeyAndStatusCode[Object.keys(examplesByKeyAndStatusCode)[0] ?? ""] ??
        {};

    // if the status code is defined and there are examples for it, we attempt to use the example at the given index. Otherwise, fall back to the first example in that list.
    // this is the most specific example we can find
    let selectedExample = examplesByStatusCode[statusCode ?? ""]?.[responseIndex ?? 0];

    // if the status code is not found, we should attempt to find a different example that has the same status code
    if (statusCode != null) {
        selectedExample ??= Object.values(examplesByKeyAndStatusCode).find((examplesByStatusCode) => {
            const examples = examplesByStatusCode[statusCode];
            return examples != null && examples.length > 0;
        })?.[statusCode]?.[0];
    }

    // as a fallback, we attempt to use the first example under the current exampleId.
    // the exampleIndex is no longer relevant here, since we're using a fallback, so just return the first found example.
    selectedExample ??= Object.keys(examplesByStatusCode)
        .sort()
        .map((statusCode) => examplesByStatusCode[statusCode])
        .filter(isNonNullish)
        .find((examples) => examples.length > 0)?.[0];

    // if all else fails, lets return the first example that can be found under the selected language
    selectedExample ??= Object.values(examplesByKeyAndStatusCode)
        .flatMap((examples) => Object.values(examples))
        .flat()[0];

    // if that fails, then the current language has no examples, so we'll choose the first language
    selectedExample ??= Object.values(
        examplesByLanguageKeyAndStatusCode[
            getAvailableLanguages(examplesByLanguageKeyAndStatusCode, defaultLanguage)[0] ?? ""
        ] ?? {},
    )
        .flatMap((examples) => Object.values(examples))
        .flat()[0];

    // reverse lookup the selected example to get the actual key, examplesByStatusCode, and examplesByKeyAndStatusCode
    const reverseLookup =
        selectedExample != null
            ? reverseLookupSelectedExample(examplesByLanguageKeyAndStatusCode, selectedExample)
            : undefined;

    return {
        selectedExampleKey: reverseLookup?.key ?? key,
        selectedExample,
        examplesByStatusCode: reverseLookup?.examplesByStatusCode ?? examplesByStatusCode,
        examplesByKeyAndStatusCode: reverseLookup?.examplesByKeyAndStatusCode ?? examplesByKeyAndStatusCode,
    };
}

/**
 * Reverse lookup the selected example to get the key, examplesByStatusCode, and examplesByKeyAndStatusCode.
 *
 * @param examplesByLanguageKeyAndStatusCode - The examples to reverse lookup.
 * @param selectedExample - The example to reverse lookup.
 * @returns The key, examplesByStatusCode, and examplesByKeyAndStatusCode for the selected example.
 */
export function reverseLookupSelectedExample(
    examplesByLanguageKeyAndStatusCode: ExamplesByLanguageKeyAndStatusCode,
    selectedExample: CodeExample,
): {
    key: SelectedExampleKey;
    examplesByStatusCode: ExamplesByStatusCode;
    examplesByKeyAndStatusCode: ExamplesByKeyAndStatusCode;
} {
    const examplesByKeyAndStatusCode = examplesByLanguageKeyAndStatusCode[selectedExample.language] ?? {};
    const examplesByStatusCode = examplesByKeyAndStatusCode[selectedExample.exampleKey] ?? {};
    const statusCode = String(selectedExample.exampleCall.responseStatusCode);
    const examples = examplesByStatusCode[statusCode] ?? [];
    const index = examples.findIndex((e) => e.key === selectedExample.key);
    return {
        key: {
            language: selectedExample.language,
            exampleKey: selectedExample.exampleKey,
            statusCode,
            responseIndex: index,
        },
        examplesByStatusCode,
        examplesByKeyAndStatusCode,
    };
}
