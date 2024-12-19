import { atomWithStorage } from "jotai/utils";
import { noop } from "ts-essentials";
import { z } from "zod";

export function atomWithStorageValidation<VALUE>(
    key: string,
    value: VALUE,
    {
        validate,
        serialize = JSON.stringify,
        parse = JSON.parse,
        getOnInit,
        isSession = false,
    }: {
        validate?: z.ZodType<VALUE>;
        serialize?: (value: VALUE) => string;
        parse?: (value: string) => VALUE;
        getOnInit?: boolean;
        isSession?: boolean;
    } = {}
): ReturnType<typeof atomWithStorage<VALUE>> {
    return atomWithStorage<VALUE>(
        key,
        value,
        {
            getItem: (key, initialValue) => {
                if (typeof window === "undefined") {
                    return initialValue;
                }

                try {
                    const stored: string | null = (
                        isSession ? window.sessionStorage : window.localStorage
                    ).getItem(key);
                    if (stored == null) {
                        return initialValue;
                    }
                    if (validate) {
                        return validate.parse(parse(stored));
                    } else {
                        return stored as VALUE;
                    }
                } catch {
                    // ignore
                }
                return initialValue;
            },
            setItem: (key, newValue) => {
                if (typeof window === "undefined") {
                    return;
                }

                try {
                    (isSession
                        ? window.sessionStorage
                        : window.localStorage
                    ).setItem(key, serialize(newValue));
                } catch {
                    // ignore
                }
            },
            removeItem: (key) => {
                if (typeof window === "undefined") {
                    return;
                }

                try {
                    (isSession
                        ? window.sessionStorage
                        : window.localStorage
                    ).removeItem(key);
                } catch {
                    // ignore
                }
            },
            subscribe: (key, callback, initialValue) => {
                if (typeof window === "undefined") {
                    return noop;
                }

                const listener = (e: StorageEvent) => {
                    if (
                        e.storageArea !==
                        (isSession
                            ? window.sessionStorage
                            : window.localStorage)
                    ) {
                        return;
                    }

                    if (e.key === key && e.newValue !== e.oldValue) {
                        callback(
                            (validate != null
                                ? validate.safeParse(e.newValue)?.data
                                : (e.newValue as VALUE)) ?? initialValue
                        );
                    }
                };
                window.addEventListener("storage", listener);
                return () => {
                    window.removeEventListener("storage", listener);
                };
            },
        },
        { getOnInit }
    );
}
