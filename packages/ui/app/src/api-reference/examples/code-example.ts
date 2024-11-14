import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import titleCase from "@fern-api/ui-core-utils/titleCase";

export interface CodeExample {
    key: string;
    exampleIndex: number;
    snippetIndex: number;
    exampleKey: string;
    language: string;
    name: string | undefined;
    code: string;
    // hast: Root;
    install: string | null | undefined;
    // TODO: it's a bit excessive to include the full example call here. this should be refactored to include just the relevant properties
    exampleCall: ApiDefinition.ExampleEndpointCall;
    globalError?: boolean;
}

export interface CodeExampleGroup {
    language: string;
    languageDisplayName: string;
    icon: string;
    examples: CodeExample[];
}

export function getIconForClient(language: string): string {
    switch (language) {
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

export function getLanguageDisplayName(language: string): string {
    switch (language) {
        case "curl":
            return "cURL";
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
