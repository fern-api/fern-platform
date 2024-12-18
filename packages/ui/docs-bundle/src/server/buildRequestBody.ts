import { assertNever } from "@fern-api/ui-core-utils";
import { ProxyRequest } from "@fern-ui/ui";
import { buildFormData } from "./buildFormData";
import { resolveSerializableFile } from "./resolveSerializableFile";

export async function buildRequestBody(
    body: ProxyRequest.SerializableBody | undefined,
): Promise<[mime: string | undefined, BodyInit | undefined]> {
    if (body == null) {
        return [undefined, undefined];
    }

    switch (body.type) {
        case "json":
            return ["application/json", JSON.stringify(body.value)];
        case "form-data": {
            const form = await buildFormData(body.value);
            return [undefined, form];
        }
        case "octet-stream": {
            if (body.value == null) {
                return [undefined, undefined];
            }
            return resolveSerializableFile(body.value);
        }
        default:
            assertNever(body);
    }
}
