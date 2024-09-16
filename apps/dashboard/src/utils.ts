export function getEnvVar(name: string, fallback?: string) {
    if (!name.startsWith("VITE_")) {
        name = "VITE_" + name;
    }
    return import.meta.env[name] ?? process?.env?.[name] ?? fallback ?? name;
}
