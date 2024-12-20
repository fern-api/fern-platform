import { assertNever, unknownToString } from "@fern-api/ui-core-utils";
import type { SerializableFormDataEntryValue } from "@fern-ui/ui";
import FormData from "form-data";
import { resolveSerializableFile } from "./resolveSerializableFile";

export async function buildFormData(
    serializedFormData: Record<string, SerializableFormDataEntryValue>,
): Promise<FormData> {
    const form = new FormData();
    for (const [key, value] of Object.entries(serializedFormData)) {
        switch (value.type) {
            case "file":
                if (value.value != null) {
                    const [contentType, buffer] = await resolveSerializableFile(value.value);
                    form.append(key, buffer, {
                        filename: value.value.name,
                        contentType,
                    });
                }
                break;
            case "fileArray": {
                for (const serializedFile of value.value) {
                    const [contentType, buffer] = await resolveSerializableFile(serializedFile);
                    form.append(key, buffer, {
                        filename: serializedFile.name,
                        contentType,
                    });
                }
                break;
            }
            case "json": {
                const content = value.contentType?.includes("application/json")
                    ? JSON.stringify(value.value)
                    : unknownToString(value.value);
                form.append(key, content, { contentType: value.contentType });
                break;
            }
            default:
                assertNever(value);
        }
    }
    return form;
}
