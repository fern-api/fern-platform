import { useCallback, useState } from "react";
import { useOnMount } from "./useOnMount";

const isServer = typeof window === "undefined";

// adapted from: https://stackoverflow.com/questions/73944543/react-custom-localstorage-hook-hydration-error-in-nextjs
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
    const [storedValue, setStoredValue] = useState(() => initialValue);

    /* prevents hydration error so that state is only initialized after server is defined */
    useOnMount(() => {
        const initialize = () => {
            if (isServer) {
                return initialValue;
            }
            try {
                // Get from local storage by key
                const item = window.localStorage.getItem(key);
                // Parse stored json or if none return initialValue
                return item ? JSON.parse(item) : initialValue;
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(error);
                return initialValue;
            }
        };

        if (!isServer) {
            setStoredValue(initialize());

            // add event listener for changes in other tabs/components
            const storageEventHandler = (evt: StorageEvent) => {
                if (evt.key === key) {
                    setStoredValue(initialize());
                }
            };
            window.addEventListener("storage", storageEventHandler);
            return () => {
                window.removeEventListener("storage", storageEventHandler);
            };
        }
        return undefined;
    });

    const setValue = useCallback(
        (value: T) => {
            try {
                // Save state
                setStoredValue((prevValue: T) => {
                    const valueToStore = value instanceof Function ? value(prevValue) : value;

                    // Save to local storage
                    if (typeof window !== "undefined") {
                        window.localStorage.setItem(key, JSON.stringify(valueToStore));
                    }

                    return valueToStore;
                });
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(error);
            }
        },
        [key]
    );
    return [storedValue, setValue];
}
