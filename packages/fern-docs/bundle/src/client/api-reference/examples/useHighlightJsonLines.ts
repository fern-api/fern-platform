import { isPlainObject } from "@fern-api/ui-core-utils";
import { JSONPath } from "jsonpath-plus";
import { useMemo } from "react";
import { JsonPropertyPath, JsonPropertyPathPart } from "./JsonPropertyPath";
import { lineNumberOf } from "./utils";

const INDENT_SPACES = 2;

/**
 * number = single line
 * [number, number] = range of lines (inclusive)
 */
type HighlightLineResult = number | [number, number];

/**
 * @internal
 *
 * This function recursively searches for the line numbers of a json object that matches the given json path.
 * Note: `jq.query` can throw an error if the json object or path is invalid, so it needs to be try-catched.
 *
 * It assumes that the json object uses `JSON.stringify(json, undefined, 2)` to format the json object, and
 * works by incrementally string-matching each part of the json path and merging the result of each part.
 *
 * @param json unknown json object to query
 * @param path json path, which is constructed from the api reference hover state
 * @param start line number where the json object starts
 * @returns a list of line numbers that match the json path
 */
export function getJsonLineNumbers(
  json: unknown,
  path: JsonPropertyPath,
  start = 0
): HighlightLineResult[] {
  const jsonString = JSON.stringify(json, undefined, INDENT_SPACES);

  const part = path[0];
  if (part == null) {
    const length = jsonString.split("\n").length;
    return length === 0
      ? []
      : length === 1
        ? [start]
        : [[start, start + length - 1]];
  }

  const query = "$" + getQueryPart(part);

  const results: unknown[] = JSONPath({
    path: query,
    json: json as null | boolean | number | string | object | any[],
  });
  if (part.type === "objectFilter") {
    if (
      isPlainObject(json) &&
      json[part.propertyName] === part.requiredStringValue
    ) {
      return getJsonLineNumbers(json, path.slice(1), start);
    }
  }

  const recursiveMatches = results.map((result) => {
    // get start of string by matching
    const toMatch = jsonStringifyAndIndent(
      result,
      part.type === "objectProperty" ? part.propertyName : undefined,
      1
    );

    const startLine = lineNumberOf(jsonString, toMatch);
    if (startLine === -1) {
      return [];
    }

    const jsonLineNumbers = getJsonLineNumbers(
      result,
      path.slice(1),
      startLine
    );

    return jsonLineNumbers.map(
      (line): HighlightLineResult =>
        typeof line === "number"
          ? start + line
          : [start + line[0], start + line[1]]
    );
  });

  return recursiveMatches.flat();
}

function jsonStringifyAndIndent(
  json: unknown,
  key: string | undefined,
  depth: number
) {
  let jsonString = JSON.stringify(json, undefined, INDENT_SPACES);
  if (key != null) {
    jsonString = `"${key}": ${jsonString}`;
  }
  return jsonString
    .split("\n")
    .map((line, idx) => (idx === 0 ? line : "  ".repeat(depth) + line))
    .join("\n");
}

function getQueryPart(path: JsonPropertyPathPart) {
  switch (path.type) {
    case "objectProperty":
      return path.propertyName != null ? `['${path.propertyName}']` : "[*]";
    case "listItem":
      return "[*]";
    case "objectFilter":
      return `[?(@.${path.propertyName}=='${path.requiredStringValue}')]`;
  }
}

export function useHighlightJsonLines(
  json: unknown,
  hoveredPropertyPath: JsonPropertyPath = [],
  jsonStartLine = 0
): HighlightLineResult[] {
  return useMemo(() => {
    if (
      hoveredPropertyPath.length === 0 ||
      jsonStartLine < 0 ||
      typeof window === "undefined"
    ) {
      return [];
    }

    try {
      return getJsonLineNumbers(json, hoveredPropertyPath, jsonStartLine + 1);
    } catch (error) {
      // TODO: sentry

      console.error("Error thrown while highlighting json lines", error);
      return [];
    }
  }, [hoveredPropertyPath, json, jsonStartLine]);
}
