import { assertNever, unknownToString } from "@fern-api/ui-core-utils";
import type { SerializableFormDataEntryValue } from "@fern-docs/ui";
import { resolveSerializableFile } from "./resolveSerializableFile";

export async function buildFormData(
    serializedFormData: Record<string, SerializableFormDataEntryValue>,
    jsonBlobShouldContainContentType: boolean = false
): Promise<FormData> {
    const form = new FormData();
    for (const [key, value] of Object.entries(serializedFormData)) {
        switch (value.type) {
            case "file":
                if (value.value != null) {
                    const [contentType, buffer] = await resolveSerializableFile(
                        value.value
                    );
                    const blob = new Blob([buffer], { type: contentType });
                    form.append(key, blob, value.value.name);
                }
                break;
            case "fileArray": {
                for (const serializedFile of value.value) {
                    const [contentType, buffer] =
                        await resolveSerializableFile(serializedFile);
                    const blob = new Blob([buffer], { type: contentType });
                    form.append(key, blob, serializedFile.name);
                }
                break;
            }
            case "json": {
                const content = value.contentType?.includes("application/json")
                    ? JSON.stringify(value.value)
                    : unknownToString(value.value);
                const blob = jsonBlobShouldContainContentType
                    ? new Blob([content], {
                          type: value.contentType ?? "application/json",
                      })
                    : content;
                form.append(key, blob);
                break;
            }
            default:
                assertNever(value);
        }
    }
    return form;
}
