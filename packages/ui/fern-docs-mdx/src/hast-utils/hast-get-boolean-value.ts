import type { MdxJsxAttribute } from "mdast-util-mdx";
import { isMdxJsxAttributeValueExpression } from "../mdx-utils/is-mdx-jsx-attr";

/**
 * Converts a string or mdx jsx attribute value expression into a boolean (true/false) or undefined.
 *
 * `<Element foo={true} />` or `<Element foo={false} />`
 *
 * this will NOT work for expressions like:
 *
 * ```mdx
 * export const myBooleanVar = true; // or false
 *
 * <Element foo={myBooleanVar} />
 * ```
 */
export function hastGetBooleanValue(value: MdxJsxAttribute["value"]): boolean | undefined {
    if (isMdxJsxAttributeValueExpression(value)) {
        return value.value === "true" ? true : value.value === "false" ? false : undefined;
    }

    return undefined;
}
