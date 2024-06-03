/**
 * Creates an object with the same keys as `object` and values generated
 * by running each own enumerable string keyed property of `object` thru
 * `iteratee`. The iteratee is invoked with three arguments:
 * (value, key, object).
 *
 * @since 2.4.0
 * @category Object
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns the new mapped object.
 * @see mapKeys
 * @example
 *
 * const users = {
 *   'fred':    { 'user': 'fred',    'age': 40 },
 *   'pebbles': { 'user': 'pebbles', 'age': 1 }
 * }
 *
 * mapValue(users, ({ age }) => age)
 * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
 */
function mapValue<VALUE, VALUE2, ITERATEE extends (input: VALUE, key: string, value: Record<string, VALUE>) => VALUE2>(
    object: Record<string, VALUE>,
    iteratee: ITERATEE,
): Record<string, VALUE2> {
    object = Object(object);
    const result: Record<string, VALUE2> = {};

    Object.keys(object).forEach((key) => {
        result[key] = iteratee(object[key], key, object);
    });
    return result;
}

export default mapValue;
