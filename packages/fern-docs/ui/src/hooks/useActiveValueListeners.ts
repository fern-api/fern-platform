import { useCallback, useEffect, useRef } from "react";

interface Return<T> {
    invokeListeners: (value: T) => void;
    registerListener: (value: T, listener: () => void) => () => void;
}

export function useActiveValueListeners<T extends string>(
    initialValue: T | undefined
): Return<T> {
    // so the callbacks are stable
    const selectedSlugRef = useRef(initialValue);
    useEffect(() => {
        selectedSlugRef.current = initialValue;
    }, [initialValue]);

    const listeners = useRef<Record<T, (() => void)[]>>(
        {} as Record<T, (() => void)[]>
    );

    const invokeListeners = useCallback((slugWithoutVersion: T) => {
        const listenersForSlug = listeners.current[slugWithoutVersion];
        if (listenersForSlug != null) {
            for (const listener of listenersForSlug) {
                setTimeout(listener, 0);
            }
        }
    }, []);

    const registerListener = useCallback((value: T, listener: () => void) => {
        const listenersForPath = (listeners.current[value] ??= []);
        listenersForPath.push(listener);
        if (value === selectedSlugRef.current) {
            listener();
        }
        return () => {
            const listenersForValue = listeners.current[value];
            if (listenersForValue != null) {
                const indexOfListenerToDelete =
                    listenersForValue.indexOf(listener);
                if (indexOfListenerToDelete === -1) {
                    // eslint-disable-next-line no-console
                    console.warn(
                        "Failed to deregister listener for useActiveValueListeners."
                    );
                } else {
                    listenersForValue.splice(indexOfListenerToDelete, 1);
                }
            }
        };
    }, []);

    return {
        invokeListeners,
        registerListener,
    };
}
