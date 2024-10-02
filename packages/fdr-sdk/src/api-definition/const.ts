/**
 * The maximum number of times to loop while unwrapping a type reference.
 * This may need to be increased if the API definition contains extremely deeply nested type references.
 */
export const LOOP_TOLERANCE = 100;

/**
 * The maximum number of times to loop while expanding type IDs.
 * Since there can be many type ids to expand, this number is an order of magnitude larger than `LOOP_TOLERANCE`.
 */
export const LARGE_LOOP_TOLERANCE = 100 ** 2;
