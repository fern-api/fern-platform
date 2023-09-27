/**
 * Can only be called client-side.
 *
 * @returns A Promise that resolves to a boolean indicating whether the page was already loaded.
 */
export function waitUntilPageIsLoaded(): Promise<boolean> {
    return new Promise<boolean>((res) => {
        if (document.readyState === "complete") {
            res(true);
        } else {
            window.addEventListener("load", () => res(false), {
                once: true,
            });
        }
    });
}
