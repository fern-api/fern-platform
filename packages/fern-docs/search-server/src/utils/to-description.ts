import { FernDocs } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { isString } from "es-toolkit/predicate";

export function toDescription(
  descriptions:
    | FernDocs.MarkdownText
    | (FernDocs.MarkdownText | undefined)[]
    | undefined
): string | undefined {
  if (descriptions == null) {
    return undefined;
  }
  if (!Array.isArray(descriptions)) {
    descriptions = [descriptions];
  }
  const stringDescriptions = descriptions.filter(isNonNullish);

  if (stringDescriptions.length !== descriptions.length) {
    throw new Error(
      "Compiled markdown detected. When generating Algolia records, you must use the unresolved (uncompiled) version of the descriptions"
    );
  }

  if (stringDescriptions.length === 0) {
    return undefined;
  }

  return stringDescriptions.filter(isString).join("\n\n");
}
