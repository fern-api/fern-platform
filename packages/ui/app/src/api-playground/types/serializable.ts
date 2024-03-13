import { JsonVariant } from "./jsonVariant";

export interface SerializableFile {
    readonly name: string;
    readonly lastModified: number;
    readonly size: number;
    readonly type: string;
    readonly dataUrl: string; // base64-encoded
}

export declare namespace SerializableFormDataEntryValue {
    interface SingleFile {
        type: "file";
        value: SerializableFile | undefined;
    }

    interface MultipleFiles {
        type: "fileArray";
        value: SerializableFile[];
    }
}

export type SerializableFormDataEntryValue =
    | JsonVariant
    | SerializableFormDataEntryValue.SingleFile
    | SerializableFormDataEntryValue.MultipleFiles;
