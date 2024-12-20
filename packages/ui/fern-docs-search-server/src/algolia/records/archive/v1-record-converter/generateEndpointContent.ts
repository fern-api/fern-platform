// DELETE ME AFTER MIGRATION

import {
  EndpointDefinition,
  TypeDefinition,
  TypeReference,
  TypeShape,
} from "@fern-api/fdr-sdk/api-definition";
import { MarkdownText } from "@fern-api/fdr-sdk/docs";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { convertMarkdownToText } from "./utils";

function stringifyTypeShape(
  typeShape: TypeShape | undefined,
  types: Record<string, TypeDefinition>,
  depth: number = 0
): string {
  if (typeShape == null || depth > 5) {
    return "unknown";
  }
  return visitDiscriminatedUnion(typeShape)._visit({
    object: (value) =>
      value.properties
        .map(
          (property) =>
            `${property.key}=${stringifyTypeShape(property.valueShape, types, depth + 1)} ${property.description ?? ""}`
        )
        .join("\n"),
    alias: (value) => stringifyTypeRef(value.value, types, depth + 1),
    enum: (value) =>
      value.values
        .map((value) => `${value.value} (${value.description ?? ""})`)
        .join(","),
    undiscriminatedUnion: (value) =>
      value.variants
        .map(
          (variant) =>
            `${stringifyTypeShape(variant.shape, types, depth + 1)} ${variant.displayName ?? ""} ${variant.description ?? ""}`
        )
        .join(" | "),
    discriminatedUnion: (value) =>
      value.variants
        .map(
          (variant) =>
            `${variant.discriminantValue} ${variant.displayName}: ${variant.extraProperties ? stringifyTypeRef(variant.extraProperties, types, depth + 1) : ""} ${variant.description ?? ""}`
        )
        .join(" | "),
  });
}

function stringifyTypeRef(
  typeRef: TypeReference,
  types: Record<string, TypeDefinition>,
  depth: number = 0
): string {
  if (depth > 5) {
    return "unknown";
  }
  return visitDiscriminatedUnion(typeRef)._visit({
    literal: (value) => value.value.value.toString(),
    id: (value) =>
      `${value.id}: ${stringifyTypeShape(types[value.id]?.shape, types, depth + 1)} ${types[value.id]?.description ?? ""}`,
    primitive: (value) => value.value.type,
    optional: (value) =>
      `${stringifyTypeShape(value.shape, types, depth + 1)}?`,
    list: (value) =>
      `List<${stringifyTypeShape(value.itemShape, types, depth + 1)}>`,
    set: (value) =>
      `Set<${stringifyTypeShape(value.itemShape, types, depth + 1)}>`,
    map: (value) =>
      `Map<${stringifyTypeShape(value.keyShape, types, depth + 1)}, ${stringifyTypeShape(value.valueShape, types, depth + 1)}>`,
    unknown: () => "unknown",
  });
}

export function generateEndpointContent(
  endpoint: EndpointDefinition,
  types: Record<string, TypeDefinition>
): string {
  // this is a hack to include the endpoint request/response json in the search index
  // and potentially use it for conversational AI in the future.
  // this needs to be rewritten as a template, with proper markdown formatting + snapshot testing.
  // also, the content is potentially trimmed to 10kb.
  const contents = [endpoint.description ?? ""];

  if (endpoint.requestHeaders != null && endpoint.requestHeaders.length > 0) {
    contents.push("## RequestHeaders\n");
    endpoint.requestHeaders.forEach((header) => {
      contents.push(
        `- ${header.key}=${stringifyTypeShape(header.valueShape, types)} ${convertMarkdownToText(header.description)}`
      );
    });
  }

  if (endpoint.path.length > 0) {
    contents.push("## Path Parameters\n");
    endpoint.path.forEach((param) => {
      contents.push(`- ${param.value}`);
    });
  }

  if (endpoint.queryParameters != null && endpoint.queryParameters.length > 0) {
    contents.push("## Query Parameters\n");
    endpoint.queryParameters.forEach((param) => {
      contents.push(
        `- ${param.key}=${stringifyTypeShape(param.valueShape, types)} ${convertMarkdownToText(param.description)}`
      );
    });
  }

  if (endpoint.requests?.[0] != null) {
    contents.push("## Request\n");
    if (endpoint.requests[0].description != null) {
      contents.push(`${endpoint.requests[0].description}\n`);
    }

    contents.push("### Body\n");

    if (endpoint.requests[0].body.type === "alias") {
      contents.push(
        `${stringifyTypeRef(endpoint.requests[0].body.value, types)}: ${convertMarkdownToText(endpoint.requests[0].description)}`
      );
    } else if (endpoint.requests[0].body.type === "formData") {
      endpoint.requests[0].body.fields.forEach((property) => {
        if (property.type === "property") {
          contents.push(
            `- ${property.key}=${stringifyTypeShape(property.valueShape, types)} ${convertMarkdownToText(property.description)}`
          );
        }
      });
    } else if (endpoint.requests[0].body.type === "object") {
      endpoint.requests[0].body.extends.forEach((extend) => {
        contents.push(`- ${extend}`);
      });
      endpoint.requests[0].body.properties.forEach((property) => {
        contents.push(
          `- ${property.key}=${stringifyTypeShape(property.valueShape, types)} ${convertMarkdownToText(property.description)}`
        );
      });
    }
  }

  if (endpoint.responses?.[0] != null) {
    contents.push("## Response\n");
    if (endpoint.responses[0].description != null) {
      contents.push(`${endpoint.responses[0].description}\n`);
    }

    contents.push("### Body\n");

    if (endpoint.responses[0].body.type === "alias") {
      contents.push(
        `${stringifyTypeRef(endpoint.responses[0].body.value, types)}: ${convertMarkdownToText(endpoint.responses[0].description)}`
      );
    } else if (endpoint.responses[0].body.type === "object") {
      endpoint.responses[0].body.extends.forEach((extend) => {
        contents.push(`- ${extend}`);
      });
      endpoint.responses[0].body.properties.forEach((property) => {
        contents.push(
          `- ${property.key}=${stringifyTypeShape(property.valueShape, types)} ${convertMarkdownToText(property.description)}`
        );
      });
    }
  }

  return contents.join("\n");
}

export function generatePageContent(rawMarkdown: MarkdownText): string {
  return convertMarkdownToText(rawMarkdown);
}
