/**
 * @returns A Promise that resolves to a boolean indicating whether the page was already loaded.
 */
export function waitForPageToLoad(): Promise<boolean> {
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

/**
 * @returns A Promise that resolves to a boolean indicating whether the dom content was already loaded.
 */
export function waitForDomContentToLoad(): Promise<boolean> {
  return new Promise<boolean>((res) => {
    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      res(true);
    } else {
      window.addEventListener("DOMContentLoaded", () => res(false), {
        once: true,
      });
    }
  });
}

export function waitForElement(
  selector: string,
  timeout?: number
): Promise<HTMLElement | undefined> {
  return new Promise((res) => {
    const node = document.querySelector<HTMLElement>(selector);
    if (node) {
      return res(node);
    }
    let isObserving = false;
    const observer = new MutationObserver(() => {
      const node = document.querySelector<HTMLElement>(selector);
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

    if (typeof timeout === "number") {
      setTimeout(() => {
        if (isObserving) {
          observer.disconnect();
          isObserving = false;
          res(undefined);
        }
      }, timeout);
    }
  });
}
