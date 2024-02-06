import { APIV1Read } from "@fern-api/fdr-sdk";
import { titleCase } from "@fern-ui/app-utils";
import { sortBy } from "lodash-es";

export interface CodeExample {
    key: string;
    exampleIndex: number;
    language: string;
    name: string;
    code: string;
    install: string | undefined;
    exampleCall: APIV1Read.ExampleEndpointCall;
}

export interface CodeExampleGroup {
    language: string;
    languageDisplayName: string;
    icon: string;
    examples: CodeExample[];
}

// key is the language
export function generateCodeExamples(examples: APIV1Read.ExampleEndpointCall[]): CodeExampleGroup[] {
    const codeExamples = new Map<string, CodeExample[]>();
    examples.forEach((example, i) => {
        codeExamples.set("curl", [
            ...(codeExamples.get("curl") ?? []),
            {
                key: `curl-${i}`,
                exampleIndex: i,
                language: "curl",
                name: example.name ?? "cURL Example",
                code: "",
                install: undefined,
                exampleCall: example,
            },
        ]);

        if (example.codeExamples.pythonSdk != null) {
            codeExamples.set("python", [
                ...(codeExamples.get("python") ?? []),
                {
                    key: `python-sync-${i}`,
                    exampleIndex: i,
                    language: "python",
                    name: example.name ?? "Python Example",
                    code: example.codeExamples.pythonSdk.sync_client,
                    install: example.codeExamples.pythonSdk.install,
                    exampleCall: example,
                },
                {
                    key: `python-async-${i}`,
                    exampleIndex: i,
                    language: "python",
                    name: `${example.name ?? "Python Example"} (Async)`,
                    code: example.codeExamples.pythonSdk.async_client,
                    install: example.codeExamples.pythonSdk.install,
                    exampleCall: example,
                },
            ]);
        }

        if (example.codeExamples.typescriptSdk != null) {
            codeExamples.set("typescript", [
                ...(codeExamples.get("typescript") ?? []),
                {
                    key: `typescript-${i}`,
                    exampleIndex: i,
                    language: "typescript",
                    name: example.name ?? "Typescript Example",
                    code: example.codeExamples.typescriptSdk.client,
                    install: example.codeExamples.typescriptSdk.install,
                    exampleCall: example,
                },
            ]);
        }

        example.codeSamples.forEach((codeSample, j) => {
            const language = cleanLanguage(codeSample.language);
            codeExamples.set(language, [
                ...(codeExamples.get(language) ?? []).filter((e) => e.exampleIndex !== i),
                {
                    key: `${language}-${i}/${j}`,
                    exampleIndex: i,
                    language,
                    name: codeSample.name ?? example.name ?? titleCase(`${language} Example`),
                    code: codeSample.code,
                    install: codeSample.install,
                    exampleCall: example,
                },
            ]);
        });
    });

    // always keep curl at the top
    const curlExamples = codeExamples.get("curl");
    codeExamples.delete("curl");
    return [
        {
            language: "curl",
            languageDisplayName: "cURL",
            icon: getIconForClient("curl"),
            examples: [...(curlExamples ?? [])],
        },
        ...sortBy(
            Array.from(codeExamples.entries()).map(([language, examples]) => ({
                language,
                languageDisplayName: titleCase(language),
                icon: getIconForClient(language),
                examples,
            })),
            "language",
        ),
    ];
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
        case "golang":
            return "fa-brands fa-go";
        case "ruby":
            return "fa-solid fa-gem";
        case "java":
        case "kotlin":
            return "fa-brands fa-java";
        case "php":
            return "fa-brands fa-php";
        default:
            return "fa-solid fa-code";
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
