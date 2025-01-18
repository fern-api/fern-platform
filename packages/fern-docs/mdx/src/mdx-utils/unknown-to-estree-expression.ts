import { isPlainObject } from "@fern-api/ui-core-utils";
import type { Expression, ExpressionStatement } from "estree";
import {
  valueToEstree,
  type Options as ValueToEstreeOptions,
} from "estree-util-value-to-estree";
import { toEstree } from "hast-util-to-estree";
import { isHastElement, isHastText } from "../hast-utils";
import { isMdxJsxElementHast } from "./is-mdx-element";
import { isMdxJsxAttributeValueExpression } from "./is-mdx-jsx-attr";

export function unknownToEstreeExpression(
  value: unknown,
  options?: ValueToEstreeOptions
): Expression {
  if (Array.isArray(value)) {
    return {
      type: "ArrayExpression",
      elements: value.map((elem) => unknownToEstreeExpression(elem, options)),
    };
  }

  if (isPlainObject(value)) {
    if (isMdxJsxAttributeValueExpression(value)) {
      // this is a bit of a hack to return the first expression statement in the body
      // TODO: improve this
      return (
        value.data?.estree?.body.find(
          (elem): elem is ExpressionStatement =>
            elem.type === "ExpressionStatement"
        )?.expression ?? {
          type: "Literal",
          value: null,
        }
      );
    }

    if (
      isHastElement(value) ||
      isHastText(value) ||
      isMdxJsxElementHast(value)
    ) {
      return (
        toEstree(value)?.body.filter(
          (elem): elem is ExpressionStatement =>
            elem.type === "ExpressionStatement"
        )?.[0]?.expression ?? {
          type: "Literal",
          value: null,
        }
      );
    }

    return {
      type: "ObjectExpression",
      properties: Object.entries(value).map(([name, val]) => ({
        type: "Property",
        method: false,
        shorthand: false,
        computed: false,
        kind: "init",
        key: valueToEstree(name, options),
        value: unknownToEstreeExpression(val, options),
      })),
    };
  }

  return valueToEstree(value, options);
}
