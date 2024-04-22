import { NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID, NEXT_PUBLIC_HIGHLIGHT_SERVICE_NAME } from "./constants";

export async function register(): Promise<void> {
    const { registerHighlight } = await import("@highlight-run/next/server");

    await registerHighlight({
        projectID: NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
        serviceName: NEXT_PUBLIC_HIGHLIGHT_SERVICE_NAME,
    });
}
