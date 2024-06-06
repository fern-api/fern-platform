import before from "./before";

/**
 * Creates a function that is restricted to invoking `func` once. Repeat calls
 * to the function return the value of the first invocation. The `func` is
 * invoked with the `this` binding and arguments of the created function.
 *
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new restricted function.
 * @example
 *
 * const initialize = once(createApplication)
 * initialize()
 * initialize()
 * // => `createApplication` is invoked once
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function once<F extends (...args: any[]) => any>(func: F): F {
    return before(2, func) as F;
}

export default once;
