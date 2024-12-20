import type { Nodes } from "mdast";

// adapted from https://github.com/syntax-tree/mdast-util-to-string/blob/main/lib/index.js
// but respects line breaks in text nodes

/**
 * Configuration options (optional).
 */
interface Options {
  /**
   * Whether to use `alt` for `image`s (default: `true`).
   */
  includeImageAlt?: boolean;

  /**
   * Whether to use `value` of HTML (default: `true`).
   */
  includeHtml?: boolean;

  /**
   * Whether to preserve newlines in text nodes (default: `true`).
   */
  preserveNewlines?: boolean;
}

/**
 * Get the text content of a node or list of nodes.
 *
 * Prefers the node’s plain-text fields, otherwise serializes its children,
 * and if the given value is an array, serialize the nodes in it.
 *
 * @param value
 *   Thing to serialize, typically `Node`.
 * @param options
 *   Configuration (optional).
 * @returns
 *   Serialized `value`.
 */
export function mdastToString(
  value?: unknown,
  {
    includeImageAlt = true,
    includeHtml = true,
    preserveNewlines = true,
  }: Options = {}
): string {
  return one(value, includeImageAlt, includeHtml, preserveNewlines).trim();
}

/**
 * One node or several nodes.
 *
 * @param value
 *   Thing to serialize.
 * @param includeImageAlt
 *   Include image `alt`s.
 * @param includeHtml
 *   Include HTML.
 * @returns
 *   Serialized node.
 */
function one(
  value: unknown,
  includeImageAlt: boolean,
  includeHtml: boolean,
  preserveNewlines: boolean
): string {
  if (node(value)) {
    if (value.type === "break" || value.type === "thematicBreak") {
      return preserveNewlines ? "\n\n" : "";
    }

    if ("value" in value) {
      return value.type === "html" && !includeHtml ? "" : value.value;
    }

    if (includeImageAlt && "alt" in value && value.alt) {
      return value.alt;
    }

    if ("children" in value) {
      return (
        all(
          value.children as unknown[],
          includeImageAlt,
          includeHtml,
          preserveNewlines
        ) +
        (preserveNewlines && hasBreak(value)
          ? "\n"
          : hasSpace(value)
            ? " "
            : "")
      );
    }
  }

  if (Array.isArray(value)) {
    return all(value, includeImageAlt, includeHtml, preserveNewlines);
  }

  return "";
}

function hasBreak(value: Extract<Nodes, { children: unknown[] }>): boolean {
  return (
    value.type === "blockquote" ||
    value.type === "list" ||
    value.type === "listItem" ||
    value.type === "paragraph" ||
    value.type === "table" ||
    value.type === "tableRow" ||
    value.type === "heading"
  );
}

function hasSpace(value: Extract<Nodes, { children: unknown[] }>): boolean {
  return hasBreak(value) || value.type === "tableCell";
}

/**
 * Serialize a list of nodes.
 *
 * @param values
 *   Thing to serialize.
 * @param includeImageAlt
 *   Include image `alt`s.
 * @param includeHtml
 *   Include HTML.
 * @returns
 *   Serialized nodes.
 */
function all(
  values: unknown[],
  includeImageAlt: boolean,
  includeHtml: boolean,
  preserveNewlines: boolean
): string {
  const result: string[] = [];
  let index = -1;

  while (++index < values.length) {
    result[index] = one(
      values[index],
      includeImageAlt,
      includeHtml,
      preserveNewlines
    );
  }

  return result.join("");
}

/**
 * Check if `value` looks like a node.
 *
 * @param value
 *   Thing.
 * @returns
 *   Whether `value` is a node.
 */
function node(value: unknown): value is Nodes {
  return Boolean(value && typeof value === "object");
}
