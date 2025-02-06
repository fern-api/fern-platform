import { z } from "zod";

export const SerializableFileSchema = z
  .object({
    name: z.string(),
    lastModified: z.number(),
    size: z.number(),
    type: z.string(),
    dataUrl: z.string({ description: "base64-encoded" }),
  })
  .readonly();

export type SerializableFile = z.infer<typeof SerializableFileSchema>;

export const SerializableSingleFileSchema = z.object({
  type: z.literal("file"),
  value: SerializableFileSchema.optional(),
});

export const SerializableMultipleFilesSchema = z.object({
  type: z.literal("fileArray"),
  value: z.array(SerializableFileSchema),
});

export const SerializableJsonSchema = z.object({
  type: z.literal("json"),
  value: z.unknown(),
  contentType: z
    .string({
      description:
        "if contentType is not provided, assume stringified JSON. Otherwise, use the provided contentType as a Blob type",
    })
    .optional(),
});

export const SerializableExplodedJsonSchema = z.object({
  type: z.literal("exploded"),
  value: z.array(z.unknown()),
  contentType: z.string().optional(),
});

export const SerializableFormDataEntryValueSchema = z.union([
  SerializableSingleFileSchema,
  SerializableMultipleFilesSchema,
  SerializableJsonSchema,
  SerializableExplodedJsonSchema,
]);

export type SerializableFormDataEntryValue = z.infer<
  typeof SerializableFormDataEntryValueSchema
>;
