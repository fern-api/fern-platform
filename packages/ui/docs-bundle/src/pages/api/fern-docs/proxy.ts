import { assertNever } from "@fern-ui/core-utils";
import type { ProxyRequest, ProxyResponse } from "@fern-ui/ui";
import { NextResponse, type NextRequest } from "next/server";
import { jsonResponse } from "../../../utils/serverResponse";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const maxDuration = 60 * 5; // 5 minutes

async function dataURLtoBlob(dataUrl: string): Promise<Blob> {
    if (dataUrl.startsWith("http:") || dataUrl.startsWith("https:")) {
        const response = await fetch(dataUrl);
        return await response.blob();
    }

    const [header, base64String] = dataUrl.split(",");
    if (header == null || base64String == null) {
        throw new Error("Invalid data URL");
    }

    const mime = header.match(/:(.*?);/)?.[1];
    const bstr = atob(base64String);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
}

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
                            const blob = await dataURLtoBlob(base64);
                            const file = new File([blob], value.value.name, { type: value.value.type });
                            formData.append(key, file);
                        }
                        break;
                    case "fileArray": {
                        const files = await Promise.all(
                            value.value.map(async (serializedFile) => {
                                const base64 = serializedFile.dataUrl;
                                const blob = await dataURLtoBlob(base64);
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
            const blob = await dataURLtoBlob(base64);
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
        const headers = new Headers(proxyRequest.headers);

        // omit content-type for multipart/form-data so that fetch can set it automatically with the boundary
        if (headers.get("Content-Type")?.toLowerCase().includes("multipart/form-data")) {
            headers.delete("Content-Type");
        }

        const response = await fetch(proxyRequest.url, {
            method: proxyRequest.method,
            headers,
            body: await buildRequestBody(proxyRequest.body),
        });
        let body = await response.text();
        try {
            body = JSON.parse(body);
        } catch (_e) {
            // Ignore
        }
        const endTime = Date.now();
        const responseHeaders = response.headers;

        return jsonResponse<ProxyResponse>(200, {
            error: false,
            response: {
                headers: Object.fromEntries(responseHeaders.entries()),
                ok: response.ok,
                redirected: response.redirected,
                status: response.status,
                statusText: response.statusText,
                type: response.type,
                url: response.url,
                body,
            },
            time: endTime - startTime,
            size: responseHeaders.get("Content-Length"),
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
