/* eslint-disable no-console */

import { isPlainObject } from "@fern-ui/core-utils";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

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

const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse<ResponseBody>): Promise<unknown> => {
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Method not allowed.",
        });
    }
    const host = req.headers["x-fern-host"] ?? req.headers["host"];

    if (typeof host !== "string") {
        return res.status(400).json({
            success: false,
            message: "Bad request: Missing or invalid host.",
        });
    }

    try {
        const parseResult = parseRequestBody(req.body);

        if (!parseResult.success) {
            // return jsonResponse<ResponseBody>(400, {
            //     success: false,
            //     message: "Bad request: " + parseResult.message,
            // });
            return res.status(400).json({
                success: false,
                message: "Bad request: " + parseResult.message,
            });
        }

        const { path } = parseResult.request;

        try {
            // eslint-disable-next-line no-console
            const url = `${host}/${path}`;
            console.log(`Revalidating ${url}`);
            await res.revalidate(`/static/${encodeURI(url)}`);
            // return jsonResponse<ResponseBody>(200, {
            //     success: true,
            //     message: "Successfully revalidated path: " + `${host}/${path}`,
            // });
            return res.status(200).json({
                success: true,
                message: "Successfully revalidated path: " + `${host}/${path}`,
            });
        } catch (e) {
            const message = e instanceof Error ? e.message : "Unknown error.";
            console.error("Revalidation error:", message);
            console.error(e);
            // return jsonResponse<ResponseBody>(500, {
            //     success: false,
            //     message: "Failed to revalidate path: " + message,
            // });
            return res.status(500).json({
                success: false,
                message: "Failed to revalidate path: " + message,
            });
        }
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error.";
        console.error(err);
        // return jsonResponse<ResponseBody>(500, { success: false, message: "Unexpected error: " + message });
        return res.status(500).json({
            success: false,
            message: "Unexpected error: " + message,
        });
    }
};

export default handler;

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
