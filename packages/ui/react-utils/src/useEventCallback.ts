import { useEffect, useMemo, useRef } from "react";

type Fn<ARGS extends unknown[], R> = (...args: ARGS) => R;

export function useEventCallback<A extends unknown[], R>(fn: Fn<A, R>): Fn<A, R> {
    const ref = useRef<Fn<A, R>>(fn);
    useEffect(() => {
        ref.current = fn;
    });
    return useMemo(
        () =>
            (...args: A): R => {
                const { current } = ref;
                return current(...args);
            },
        [],
    );
}
