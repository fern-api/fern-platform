/* eslint-disable no-console */

import { isPlainObject } from "@fern-ui/core-utils";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { jsonResponse } from "../../../utils/serverResponse";

interface RequestBody {
    path: string;
}

type ResponseBody = SuccessResponseBody | ErrorResponseBody;

interface SuccessResponseBody {
    success: true;
    message: string;
}

interface ErrorResponseBody {
    success: false;
    message: string;
}

type ParseResult = SuccessParseResult | ErrorParseResult;

interface SuccessParseResult {
    success: true;
    request: RequestBody;
}

interface ErrorParseResult {
    success: false;
    message: string;
}
export const runtime = "edge";

export async function POST(req: NextRequest): Promise<NextResponse> {
    const host = req.headers.get("x-fern-host") ?? req.nextUrl.host;
    try {
        const parseResult = parseRequestBody(await req.json());

        if (!parseResult.success) {
            return jsonResponse<ResponseBody>(400, {
                success: false,
                message: "Bad request: " + parseResult.message,
            });
        }

        const { path } = parseResult.request;

        try {
            revalidatePath(`static/${host}/${path}`, "page");
            return jsonResponse<ResponseBody>(200, {
                success: true,
                message: "Successfully revalidated path: " + `${host}/${path}`,
            });
        } catch (e) {
            const message = e instanceof Error ? e.message : "Unknown error.";
            console.error("Revalidation error:", message);
            console.error(e);
            return jsonResponse<ResponseBody>(500, {
                success: false,
                message: "Failed to revalidate path: " + message,
            });
        }
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error.";
        console.error(err);
        return jsonResponse<ResponseBody>(500, { success: false, message: "Unexpected error: " + message });
    }
}

function parseRequestBody(rawBody: unknown): ParseResult {
    if (!isPlainObject(rawBody)) {
        return { success: false, message: "Request body is not a plain object." };
    }
    const { path } = rawBody;
    if (typeof path !== "string") {
        return { success: false, message: 'Expected "path" in request body to be a string.' };
    }
    return { success: true, request: { path } };
}
