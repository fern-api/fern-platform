"use client";

import { useEffect } from "react";

interface UseTrapFocusProps {
    container: HTMLElement | null;
}

// https://github.com/algolia/docsearch/blob/main/packages/docsearch-react/src/useTrapFocus.ts
export function useTrapFocus({ container }: UseTrapFocusProps): void {
    useEffect(() => {
        if (!container) {
            return undefined;
        }

        const focusableElements = container.querySelectorAll<HTMLElement>(
            "a[href]:not([disabled]), button:not([disabled]), input:not([disabled])",
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        function trapFocus(event: KeyboardEvent) {
            if (event.key !== "Tab") {
                return;
            }

            if (event.shiftKey) {
                if (document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                }
            } else if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }

        container.addEventListener("keydown", trapFocus);

        return () => {
            container.removeEventListener("keydown", trapFocus);
        };
    }, [container]);
}
