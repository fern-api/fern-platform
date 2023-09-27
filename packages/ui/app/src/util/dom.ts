/**
 * @returns A Promise that resolves to a boolean indicating whether the page was already loaded.
 */
export function waitForPageLoad(): Promise<boolean> {
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

export function waitForElement(selector: string, timeout = 10_000): Promise<Element | undefined> {
    return new Promise((res) => {
        const node = document.querySelector(selector);
        if (node) {
            return res(node);
        }
        let isObserving = false;
        const observer = new MutationObserver(() => {
            const node = document.querySelector(selector);
            if (node) {
                observer.disconnect();
                isObserving = false;
                res(node);
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
        isObserving = true;
        setTimeout(() => {
            if (isObserving) {
                observer.disconnect();
                isObserving = false;
                res(undefined);
            }
        }, timeout);
    });
}
