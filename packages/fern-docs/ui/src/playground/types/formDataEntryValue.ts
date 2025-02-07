export declare namespace PlaygroundFormDataEntryValue {
  interface SingleFile {
    type: "file";
    value: File | undefined;
  }

  interface MultipleFiles {
    type: "fileArray";
    value: readonly File[];
  }

  interface Json {
    type: "json";
    value: unknown;
  }

  interface Exploded {
    type: "exploded";
    value: unknown[];
  }
}

export type PlaygroundFormDataEntryValue =
  | PlaygroundFormDataEntryValue.SingleFile
  | PlaygroundFormDataEntryValue.MultipleFiles
  | PlaygroundFormDataEntryValue.Json
  | PlaygroundFormDataEntryValue.Exploded;

export const PlaygroundFormDataEntryValue = {
  isSingleFile: (
    value: PlaygroundFormDataEntryValue
  ): value is PlaygroundFormDataEntryValue.SingleFile => value.type === "file",
  isMultipleFiles: (
    value: PlaygroundFormDataEntryValue
  ): value is PlaygroundFormDataEntryValue.MultipleFiles =>
    value.type === "fileArray",
  isJson: (
    value: PlaygroundFormDataEntryValue
  ): value is PlaygroundFormDataEntryValue.Json => value.type === "json",
  isExploded: (
    value: PlaygroundFormDataEntryValue
  ): value is PlaygroundFormDataEntryValue.Exploded =>
    value.type === "exploded",
};
