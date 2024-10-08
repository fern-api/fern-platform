import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { titleCase } from "@fern-ui/core-utils";
import { sortBy } from "lodash-es";

export interface CodeExample {
    key: string;
    exampleIndex: number;
    language: string;
    name: string;
    code: string;
    // hast: Root;
    install: string | null | undefined;
    exampleCall: ApiDefinition.ExampleEndpointCall;
}

export interface CodeExampleGroup {
    language: string;
    languageDisplayName: string;
    icon: string;
    examples: CodeExample[];
}

// key is the language
export function generateCodeExamples(
    examples: ApiDefinition.ExampleEndpointCall[] | undefined,
    grpc: boolean = false,
): CodeExampleGroup[] {
    const codeExamples = new Map<string, CodeExample[]>();
    examples?.forEach((example, i) => {
        if (example.snippets == null) {
            return;
        }
        Object.values(example.snippets).forEach((snippets) => {
            snippets.forEach((snippet, j) => {
                if (!grpc || snippet.language !== "curl") {
                    codeExamples.set(snippet.language, [
                        ...(codeExamples.get(snippet.language) ?? []),
                        {
                            key: `${snippet.language}-${i}/${j}`,
                            exampleIndex: i,
                            language: snippet.language,
                            name: snippet.name ?? example.name ?? `Example ${i + 1}`,
                            code: snippet.code,
                            // hast: snippet.hast,
                            install: snippet.install,
                            exampleCall: example,
                        },
                    ]);
                }
            });
        });
    });

    // always keep curl at the top
    const curlExamples = codeExamples.get("curl");
    codeExamples.delete("curl");

    // TODO: remove after pinecone examples
    const examplesByLanguage = grpc
        ? []
        : [
              {
                  language: "curl",
                  languageDisplayName: "cURL",
                  icon: getIconForClient("curl"),
                  examples: [...(curlExamples ?? [])],
              },
          ];

    return examplesByLanguage.concat([
        ...sortBy(
            Array.from(codeExamples.entries()).map(([language, examples]) => ({
                language,
                languageDisplayName: getLanguageDisplayName(language),
                icon: getIconForClient(language),
                examples,
            })),
            "language",
        ),
    ]);
}

function getIconForClient(clientId: string) {
    switch (clientId) {
        case "curl":
        case "shell":
        case "bash":
            return "fa-solid fa-terminal";
        case "python":
            return "fa-brands fa-python";
        case "javascript":
        case "typescript":
            return "fa-brands fa-js";
        case "go":
        case "golang":
            return "fa-brands fa-golang";
        case "ruby":
            return "fa-solid fa-gem";
        case "java":
            return "fa-brands fa-java";
        case "kotlin":
            return "fa-brands fa-android"; // TODO: change to kotlin icon
        case ".net":
        case "dotnet":
        case "c#":
        case "csharp":
            return "fa-brands fa-microsoft"; // TODO: change to csharp icon
        case "php":
            return "fa-brands fa-php";
        case "swift":
            return "fa-brands fa-swift";
        case "rust":
            return "fa-brands fa-rust";
        default:
            return "fa-solid fa-code";
    }
}

function getLanguageDisplayName(language: string) {
    switch (language) {
        case "go":
        case "golang":
            return "Go";
        case ".net":
            return ".NET";
        case "c#":
        case "csharp":
            return "C#";
        default:
            return titleCase(language);
    }
}

// export interface CodeExampleClientCurl {
//     id: "curl";
//     name: string;
// }

// export interface PythonCodeExample {
//     id: "python" | "python-async";
//     name: string;
//     language: string;
//     example: string;
// }

// export interface TypescriptCodeExample {
//     id: "typescript";
//     name: string;
//     language: string;
//     example: string;
// }

// export type CodeExampleClient = CodeExampleClientCurl | PythonCodeExample | TypescriptCodeExample;

// export type CodeExampleClientId = CodeExampleClient["id"];
