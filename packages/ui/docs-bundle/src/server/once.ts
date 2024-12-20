export function once<P, R>(fn: (...args: P[]) => R): (...args: P[]) => R {
    let called = false;
    let result: R;

    return function (this: unknown, ...args: P[]) {
        if (!called) {
            called = true;
            result = fn.apply(this, args);
        }

        return result;
    };
}
