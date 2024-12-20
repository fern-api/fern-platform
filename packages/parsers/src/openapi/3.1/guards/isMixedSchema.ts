import { MixedSchemaConverterNode } from "../schemas/MixedSchemaConverter.node";
import { isArraySchema } from "./isArraySchema";
import { isNonArraySchema } from "./isNonArraySchema";

<<<<<<< HEAD
export function isMixedSchema(schema: unknown): schema is MixedSchemaConverterNode.Input {
    return (
        schema != null &&
        Array.isArray(schema) &&
        schema.every((type) => type.type === "null" || isNonArraySchema(type) || isArraySchema(type))
    );
=======
export function isMixedSchema(
  schema: unknown
): schema is MixedSchemaConverterNode.Input {
  return (
    schema != null &&
    Array.isArray(schema) &&
    schema.every(
      (type) =>
        type.type === "null" || isNonArraySchema(type) || isArraySchema(type)
    )
  );
>>>>>>> main
}
