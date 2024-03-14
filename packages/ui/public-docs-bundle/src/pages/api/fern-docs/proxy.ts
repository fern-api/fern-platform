import { assertNever } from "@fern-ui/core-utils";
import type { ProxyRequest, ProxyResponse } from "@fern-ui/ui";
import { NextResponse, type NextRequest } from "next/server";
import { jsonResponse } from "../../../utils/serverResponse";

export const runtime = "edge";

async function buildRequestBody(body: ProxyRequest.SerializableBody | undefined): Promise<BodyInit | undefined> {
    if (body == null) {
        return undefined;
    }

    switch (body.type) {
        case "json":
            return JSON.stringify(body.value);
        case "form-data": {
            const formData = new FormData();
            for (const [key, value] of Object.entries(body.value)) {
                switch (value.type) {
                    case "file":
                        if (value.value != null) {
                            const base64 = value.value.dataUrl;
                            const blob = await (await fetch(base64)).blob();
                            const file = new File([blob], value.value.name, { type: value.value.type });
                            formData.append(key, file);
                        }
                        break;
                    case "fileArray": {
                        const files = await Promise.all(
                            value.value.map(async (serializedFile) => {
                                const base64 = serializedFile.dataUrl;
                                const blob = await (await fetch(base64)).blob();
                                return new File([blob], serializedFile.name, { type: serializedFile.type });
                            }),
                        );
                        files.forEach((file) => formData.append(key, file, file.name));
                        break;
                    }
                    case "json":
                        formData.append(key, JSON.stringify(value.value));
                        break;
                    default:
                        assertNever(value);
                }
            }
            return formData;
        }
        case "octet-stream": {
            if (body.value == null) {
                return undefined;
            }
            const base64 = body.value.dataUrl;
            const blob = await (await fetch(base64)).blob();
            return new File([blob], body.value.name, { type: body.value.type });
        }
        default:
            assertNever(body);
    }
}

export default async function POST(req: NextRequest): Promise<NextResponse> {
    if (req.method !== "POST") {
        return new NextResponse(null, { status: 405 });
    }
    const startTime = Date.now();
    try {
        const proxyRequest = (await req.json()) as ProxyRequest;
        const response = await fetch(proxyRequest.url, {
            method: proxyRequest.method,
            headers: new Headers(await decryptHeaders(proxyRequest.headers)),
            body: await buildRequestBody(proxyRequest.body),
        });
        let body = await response.text();
        try {
            body = JSON.parse(body);
        } catch (_e) {
            // Ignore
        }
        const endTime = Date.now();
        const headers = response.headers;

        return jsonResponse<ProxyResponse>(200, {
            error: false,
            response: {
                headers: Object.fromEntries(headers.entries()),
                ok: response.ok,
                redirected: response.redirected,
                status: response.status,
                statusText: response.statusText,
                type: response.type,
                url: response.url,
                body,
            },
            time: endTime - startTime,
            size: headers.get("Content-Length"),
        });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        const endTime = Date.now();

        return jsonResponse<ProxyResponse>(500, {
            error: true,
            status: 500,
            time: endTime - startTime,
            size: null,
        });
    }
}

function getPrivateKey(): string {
    const key = process.env.API_PLAYGROUND_PRIVATE_KEY;
    if (key == null) {
        throw new Error("API_PLAYGROUND_PRIVATE_KEY is not set");
    }

    return key;
}

async function decryptHeader(value: string): Promise<string> {
    if (value.startsWith("fern_")) {
        value = value.slice("fern_".length);

        const JSEncrypt = (await import("jsencrypt")).default;
        const encrypt = new JSEncrypt();
        encrypt.setPrivateKey(getPrivateKey());
        const decrypted = encrypt.decrypt(value);

        if (!decrypted) {
            throw new Error("Failed to decrypt header");
        }

        value = decrypted;
    } else if (value.toLowerCase().startsWith("bearer ")) {
        value = "Bearer " + (await decryptHeader(value.slice("Bearer ".length)));
    } else if (value.toLowerCase().startsWith("basic ")) {
        value = "Basic " + (await decryptHeader(value.slice("Basic ".length)));
    }

    return value;
}

async function decryptHeaders(headers: Record<string, string>): Promise<Record<string, string>> {
    return Object.fromEntries(
        await Promise.all(Object.entries(headers).map(async ([key, value]) => [key, await decryptHeader(value)])),
    );
}
