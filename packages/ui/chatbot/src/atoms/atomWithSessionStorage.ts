import { atomWithStorage, RESET } from "jotai/utils";
import type { WritableAtom } from "jotai/vanilla";
import { noop } from "lodash-es";

export function atomWithSessionStorage<Value>(
    key: string,
    initialValue: Value,
): WritableAtom<Value, [Value | typeof RESET | ((prev: Value) => Value | typeof RESET)], void> {
    return atomWithStorage<Value>(key, initialValue, {
        getItem: (key, initialValue) => {
            if (typeof window === "undefined") {
                return initialValue;
            }

            try {
                const stored: string | null = window.sessionStorage.getItem(key);
                if (stored == null) {
                    return initialValue;
                }
                return JSON.parse(stored);
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error(e);
            }
            return initialValue;
        },
        setItem: (key, newValue) => {
            if (typeof window === "undefined") {
                return;
            }

            try {
                window.sessionStorage.setItem(key, JSON.stringify(newValue));
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error(e);
            }
        },
        removeItem: (key) => {
            if (typeof window === "undefined") {
                return;
            }

            try {
                window.sessionStorage.removeItem(key);
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error(e);
            }
        },
        subscribe: (key, callback) => {
            if (typeof window === "undefined") {
                return noop;
            }

            const listener = (event: StorageEvent) => {
                if (event.key === key && event.storageArea === window.sessionStorage) {
                    if (event.newValue == null) {
                        callback(initialValue);
                    } else {
                        callback(JSON.parse(event.newValue));
                    }
                }
            };

            window.addEventListener("storage", listener);
            return () => {
                window.removeEventListener("storage", listener);
            };
        },
    });
}
