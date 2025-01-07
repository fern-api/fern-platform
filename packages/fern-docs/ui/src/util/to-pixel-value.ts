/**
 * Strips units from a size property.
 *
 * @param prop - The size property to strip units from.
 * @returns The size property without units. undefined otherwise, or if the unit cannot be converted to a pixel value.
 */
export function toPixelValue(
  prop: string | number | undefined
): number | undefined {
  if (prop == null || typeof prop === "number") {
    return prop;
  } else if (/^\d+$/.test(prop)) {
    return Number(prop);
  } else if (/^\d+(\.\d+)?(px)$/.test(prop)) {
    return Number(prop.slice(0, -2));
  } else if (/^\d+(\.\d+)?(rem)$/.test(prop)) {
    return Number(prop.slice(0, -3)) * 16;
  }

  return undefined;
}
