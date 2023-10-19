/* eslint-disable no-console */

import { isPlainObject } from "@fern-ui/core-utils";
import { NextApiHandler, NextApiResponse } from "next";

interface RequestBody {
    path: string;
}

type ResponseBody = SuccessResponseBody | ErrorResponseBody;

interface SuccessResponseBody {
    success: true;
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

const handler: NextApiHandler = async (req, res: NextApiResponse<ResponseBody>) => {
    try {
        if (req.method !== "POST") {
            res.status(400).send({
                success: false,
                message: "Bad request: Accepts POST requests only",
            });
            return;
        }

        // when we call res.revalidate() nextjs uses
        // req.headers.host to make the network request
        if (typeof req.headers["x-fern-host"] === "string") {
            req.headers.host = req.headers["x-fern-host"];
            res.setHeader("host", req.headers["x-fern-host"]);
        }

        const parseResult = parseRequestBody(req.body);

        if (!parseResult.success) {
            res.status(400).send({
                success: false,
                message: `Bad request. ${parseResult.message}`,
            });
            return;
        }

        const { path } = parseResult.request;

        try {
            await res.revalidate(path);
            console.log("Successfully revalidated path:", path);
            res.status(200).send({ success: true });
        } catch (e) {
            const message = e instanceof Error ? e.message : "Unknown error.";
            console.error("Revalidation error:", message);
            console.error(e);
            res.status(500).send({
                success: false,
                message: "Failed to revalidate path: " + message,
            });
        }
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error.";
        console.error("Unexpected error:", message);
        res.status(500).send({
            success: false,
            message: "Unexpected error: " + message,
        });
    }
};

export default handler;
