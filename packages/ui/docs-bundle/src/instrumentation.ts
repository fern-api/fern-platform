export async function register(): Promise<void> {
    const { registerHighlight } = await import("@highlight-run/next/server");

    await registerHighlight({
        projectID: "3ej4m3ye",
        serviceName: "docs-frontend-server",
    });
}
