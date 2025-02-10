import { compact, flatten } from "es-toolkit/array";

import {
  FormDataField,
  HttpRequestBodyShape,
} from "@fern-api/fdr-sdk/api-definition";
import { assertNever, isNonNullish } from "@fern-api/ui-core-utils";

import { blobToDataURL } from "../fetch-utils/blobToDataURL";
import {
  PlaygroundFormStateBody,
  ProxyRequest,
  SerializableFile,
  SerializableFormDataEntryValue,
} from "../types";

export async function serializeFormStateBody(
  shape: HttpRequestBodyShape | undefined,
  body: PlaygroundFormStateBody | undefined,
  usesApplicationJsonInFormDataValue: boolean
): Promise<ProxyRequest.SerializableBody | undefined> {
  if (shape == null || body == null) {
    return undefined;
  }

  switch (body.type) {
    case "json":
      return { type: "json", value: body.value };
    case "form-data": {
      const formDataValue: Record<string, SerializableFormDataEntryValue> = {};
      for (const [key, value] of Object.entries(body.value)) {
        switch (value.type) {
          case "file":
            formDataValue[key] = {
              type: "file",
              value: await serializeFile(value.value),
            };
            break;
          case "fileArray":
            formDataValue[key] = {
              type: "fileArray",
              value: (
                await Promise.all(
                  value.value.map((value) => serializeFile(value))
                )
              ).filter(isNonNullish),
            };
            break;
          case "json": {
            if (shape.type !== "formData") {
              return undefined;
            }
            const property = shape.fields.find(
              (p): p is FormDataField.Property =>
                p.key === key && p.type === "property"
            );

            const contentType =
              compact(flatten([property?.contentType]))[0] ??
              (usesApplicationJsonInFormDataValue
                ? "application/json"
                : undefined);

            if (property?.exploded) {
              // For exploded form fields, convert value to array if not already
              const arrayValue = Array.isArray(value.value)
                ? value.value
                : [value.value];
              formDataValue[key] = {
                type: "exploded",
                value: arrayValue,
                contentType,
              };
              break;
            }

            // check if the json value is a string and performa a safe parse operation to check if the json is stringified
            if (typeof value.value === "string") {
              value.value = safeParse(value.value);
            }

            formDataValue[key] = {
              ...value,
              // this is a hack to allow the API Playground to send JSON blobs in form data
              // revert this once we have a better solution
              contentType,
            };
            break;
          }
          default:
            assertNever(value);
        }
      }
      return { type: "form-data", value: formDataValue };
    }
    case "octet-stream":
      return {
        type: "octet-stream",
        value: await serializeFile(body.value),
      };
    default:
      assertNever(body);
  }
}

async function serializeFile(
  file: File | undefined
): Promise<SerializableFile | undefined> {
  if (file == null || !isFile(file)) {
    return undefined;
  }
  return {
    name: file.name,
    lastModified: file.lastModified,
    size: file.size,
    type: file.type,
    dataUrl: await blobToDataURL(file),
  };
}

function isFile(value: any): value is File {
  return value instanceof File;
}

function safeParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
