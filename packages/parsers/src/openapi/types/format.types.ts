// Copied from https://spec.openapis.org/registry/format/

export type ConstArrayToType<T extends readonly unknown[]> = T[number];

export const OPENAPI_NUMBER_TYPE_FORMAT = [
  "decimal",
  "decimal128",
  "double-int",
  "double",
  "float",
  "sf-decimal",
] as const;
export const OPENAPI_INTEGER_TYPE_FORMAT = [
  "int16",
  "int32",
  "int64",
  "int8",
  "sf-integer",
  "uint8",
] as const;
export const OPENAPI_STRING_TYPE_FORMAT = [
  "base64url",
  "binary",
  "byte",
  "char",
  "commonmark",
  "date-time",
  "date",
  "decimal",
  "decimal128",
  "duration",
  "email",
  "hostname",
  "html",
  "http-date",
  "idn-email",
  "idn-hostname",
  "int64",
  "ipv4",
  "ipv6",
  "iri-reference",
  "iri",
  "json-pointer",
  "media-range",
  "password",
  "regex",
  "relative-json-pointer",
  "sf-binary",
  "sf-boolean",
  "sf-string",
  "sf-token",
  "time",
  "uri-reference",
  "uri-template",
  "uri",
  "uuid",
] as const;

export const SUPPORTED_X_FERN_AVAILABILITY_VALUES = [
  "pre-release",
  "in-development",
  "generally-available",
  "deprecated",
] as const;
export const SUPPORTED_REQUEST_CONTENT_TYPES = [
  "json",
  "form-data",
  "stream",
] as const;
export const SUPPORTED_RESPONSE_CONTENT_TYPES = [
  "application/json",
  "text/event-stream",
  "application/octet-stream",
] as const;
export const SUPPORTED_STREAMING_FORMATS = ["json", "sse"] as const;
export const SUPPORTED_MULTIPART_TYPES = ["file", "files", "property"] as const;
