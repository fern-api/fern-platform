import type { LanguageRegistration } from "shiki";

export const additionalLanguages: Record<
    string,
    () => Promise<LanguageRegistration>
> = {
    baml: (): Promise<LanguageRegistration> =>
        import("./baml").then((baml) => baml.default as LanguageRegistration),
    jinja: (): Promise<LanguageRegistration> =>
        import("./jinja").then(
            (jinja) => jinja.default as LanguageRegistration
        ),
};
