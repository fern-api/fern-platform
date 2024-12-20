import { SupportedLanguage } from "../client/APIV1Read";

export function cleanLanguage(language: string): string {
    language = language.toLowerCase().trim();
    if (["node", "nodejs", "js", "javascript"].includes(language)) {
        return SupportedLanguage.Javascript;
    }

    if (["py", "python"].includes(language)) {
        return SupportedLanguage.Python;
    }

    if (["ts", "typescript", "ts-node"].includes(language)) {
        return SupportedLanguage.Typescript;
    }

    if (["go", "golang"].includes(language)) {
        return SupportedLanguage.Go;
    }

    return language;
}
