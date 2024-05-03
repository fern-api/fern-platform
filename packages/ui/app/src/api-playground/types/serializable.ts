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

    interface Json {
        type: "json";
        value: unknown;

        // if contentType is not provided, assume stringified JSON. Otherwise, use the provided contentType as a Blob type
        contentType: string | undefined;
    }
}

export type SerializableFormDataEntryValue =
    | SerializableFormDataEntryValue.Json
    | SerializableFormDataEntryValue.SingleFile
    | SerializableFormDataEntryValue.MultipleFiles;
