export declare namespace PlaygroundFormDataEntryValue {
  interface SingleFile {
    type: "file";
    value: File | undefined;
  }

  interface MultipleFiles {
    type: "fileArray";
    value: ReadonlyArray<File>;
  }

  interface Json {
    type: "json";
    value: unknown;
  }
}

export type PlaygroundFormDataEntryValue =
  | PlaygroundFormDataEntryValue.SingleFile
  | PlaygroundFormDataEntryValue.MultipleFiles
  | PlaygroundFormDataEntryValue.Json;

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
};
