import { Algolia, ApiDefinition, FernDocs } from "@fern-api/fdr-sdk";
import { isNonNullish, titleCase } from "@fern-api/ui-core-utils";
import { camelCase, upperFirst } from "es-toolkit/string";
import { UnreachableCaseError } from "ts-essentials";

export function convertNameToAnchorPart(
  name: string | null | undefined
): string | undefined {
  if (name == null) {
    return undefined;
  }
  return upperFirst(camelCase(name));
}

// TODO: improve the title
function toTitle(last: ApiDefinition.KeyPathItem): string {
  switch (last.type) {
    case "discriminatedUnionVariant":
      return last.discriminantDisplayName ?? titleCase(last.discriminantValue);
    case "enumValue":
      return last.value;
    case "extra":
      return "Extra Properties";
    case "list":
      return "List";
    case "mapValue":
      return "Map Value";
    case "meta":
      return last.displayName ?? titleCase(last.value);
    case "objectProperty":
      return last.key;
    case "set":
      return "Set";
    case "undiscriminatedUnionVariant":
      return last.displayName ?? `Variant ${last.idx}`;
  }
}

export function toDescription(
  descriptions: (FernDocs.MarkdownText | undefined)[]
): string | undefined {
  descriptions = descriptions.filter(isNonNullish);
  const stringDescriptions = descriptions.filter(
    (d): d is string => typeof d === "string"
  );

  if (stringDescriptions.length !== descriptions.length) {
    throw new Error(
      "Compiled markdown detected. When generating Algolia records, you must use the unresolved (uncompiled) version of the descriptions"
    );
  }

  if (stringDescriptions.length === 0) {
    return undefined;
  }

  return stringDescriptions.join("\n\n");
}

export function toBreadcrumbs(
  record: Pick<Algolia.AlgoliaRecord.PageV4, "breadcrumbs" | "title" | "slug">,
  path: ApiDefinition.KeyPathItem[]
): Algolia.BreadcrumbsV2 {
  const records = [
    ...record.breadcrumbs,
    { title: record.title, slug: record.slug },
  ];

  let slug = `${record.slug}#`;

  // don't include the last part of the path
  path.forEach((item) => {
    const title = toTitle(item);
    switch (item.type) {
      case "discriminatedUnionVariant": {
        // TODO: don't use the display name for discriminated unions (but this must mirror the frontend)
        slug += encodeURIComponent(title);
        records.push({ title, slug });
        slug += ".";
        break;
      }
      case "enumValue":
        slug += encodeURIComponent(item.value);
        records.push({ title, slug });
        slug += ".";
        break;
      case "extra":
        slug += "extra";
        records.push({ title, slug });
        slug += ".";
        break;
      case "list":
      case "set":
      case "mapValue":
        // the frontend currently doesn't append anything for lists or sets (will this cause collisions?)
        break;
      case "meta":
        slug += encodeURIComponent(item.value);
        if (item.displayName) {
          records.push({ title: item.displayName, slug });
        }
        slug += ".";
        break;
      case "objectProperty":
        slug += encodeURIComponent(item.key);
        records.push({ title, slug });
        slug += ".";
        break;
      case "undiscriminatedUnionVariant":
        slug += encodeURIComponent(item.displayName ?? item.idx.toString());
        if (item.displayName) {
          records.push({ title, slug });
        }
        break;
      default:
        throw new UnreachableCaseError(item);
    }
  });

  return records;
}
