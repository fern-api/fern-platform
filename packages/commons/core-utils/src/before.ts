/**
 * Creates a function that invokes `func`, with the `this` binding and arguments
 * of the created function, while it's called less than `n` times. Subsequent
 * calls to the created function return the result of the last `func` invocation.
 *
 * @since 3.0.0
 * @category Function
 * @param {number} n The number of calls at which `func` is no longer invoked.
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new restricted function.
 * @example
 *
 * jQuery(element).on('click', before(5, addContactToList))
 * // => Allows adding up to 4 contacts to the list.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function before<F extends (...args: any[]) => any>(n: number, func: F): (...args: Parameters<F>) => ReturnType<F> {
    let result: ReturnType<F> | undefined;
    if (typeof func !== "function") {
        throw new TypeError("Expected a function");
    }
    return function (...args: Parameters<F>): ReturnType<F> {
        if (--n > 0) {
            result = func.apply(this, args);
        }
        if (n <= 1) {
            func = undefined as unknown as F; // A way to "disable" the function without type errors
        }
        return result as ReturnType<F>;
    };
}

export default before;
