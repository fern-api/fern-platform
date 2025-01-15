import { JSONSchema } from "@open-rpc/meta-schema";

export function generateExampleForJsonSchema(schema: JSONSchema): unknown {
  if (typeof schema === "boolean") {
    return schema;
  }

  if (schema.enum != null && schema.enum.length > 0) {
    return schema.enum[0];
  }

  if (schema.const != null) {
    return schema.const;
  }

  if (schema.examples != null && schema.examples.length > 0) {
    return schema.examples[0];
  }

  if (schema.type === "object") {
    const example: Record<string, unknown> = {};
    if (schema.properties != null) {
      for (const [key, value] of Object.entries(schema.properties)) {
        example[key] = generateExampleForJsonSchema(value);
      }
    }
    return example;
  }

  if (schema.type === "array") {
    if (schema.items == null) {
      return [];
    }
    if (Array.isArray(schema.items)) {
      return schema.items.map((item) => generateExampleForJsonSchema(item));
    }
    return [generateExampleForJsonSchema(schema.items)];
  }

  if (schema.type === "string") {
    return schema.default ?? "string";
  }

  if (schema.type === "number" || schema.type === "integer") {
    return schema.default ?? 0;
  }

  if (schema.type === "boolean") {
    return schema.default ?? false;
  }

  if (schema.type === "null") {
    return null;
  }

  if (schema.oneOf?.[0] != null) {
    return generateExampleForJsonSchema(schema.oneOf[0]);
  }

  if (schema.anyOf?.[0] != null) {
    return generateExampleForJsonSchema(schema.anyOf[0]);
  }

  if (schema.allOf != null && schema.allOf.length > 0) {
    const example: Record<string, unknown> = {};
    for (const subSchema of schema.allOf) {
      if (subSchema != null) {
        Object.assign(example, generateExampleForJsonSchema(subSchema));
      }
    }
    return example;
  }

  return undefined;
}
