export function getEnvVar(name: string, fallback?: string) {
    return import.meta.env[name] ?? process?.env?.[name] ?? fallback ?? name;
}
