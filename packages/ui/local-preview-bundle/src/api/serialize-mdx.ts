import { FdrAPI, FdrClient, PathResolver, type FullSlug } from "@fern-api/fdr-sdk";
import { SerializedMdxContent, serializeMdxContent } from "@fern-ui/app-utils";
import { isPlainObject } from "@fern-ui/core-utils";
import { NextApiHandler, NextApiResponse } from "next";

const REGISTRY_SERVICE = new FdrClient({
    environment: "http://localhost:3000",
});

interface Request {
    fullSlugs: string[];
}

type Result = {
    fullSlug: string;
    serializedMdxContent: SerializedMdxContent | null;
};

interface SuccessResponse {
    success: true;
    results: Record<FullSlug, SerializedMdxContent | null>;
}

interface ErrorResponse {
    success: false;
    message: string;
}

type Response = SuccessResponse | ErrorResponse;

function parseRequestBody(rawBody: unknown): Request | undefined {
    try {
        if (typeof rawBody !== "string") {
            return undefined;
        }
        const parsed = JSON.parse(rawBody);
        if (!isPlainObject(parsed)) {
            return undefined;
        }
        const { fullSlugs } = parsed;
        if (!Array.isArray(fullSlugs) || fullSlugs.some((s) => typeof s !== "string")) {
            return undefined;
        }
        return { fullSlugs };
    } catch (e) {
        return undefined;
    }
}

const handler: NextApiHandler = async (req, res: NextApiResponse<Response>) => {
    try {
        if (req.method !== "POST") {
            res.status(400).send({
                success: false,
                message: "Bad request: Accepts POST requests only",
            });
            return;
        }

        const request = parseRequestBody(req.body);

        if (request == null) {
            res.status(400).send({
                success: false,
                message: 'Bad request: "fullSlugs" must be an array of strings.',
            });
            return;
        }

        const { fullSlugs } = request;

        if (process.env.NEXT_PUBLIC_DOCS_DOMAIN == null) {
            res.status(500).send({
                success: false,
                message: "Environment missing docs domain",
            });
            return;
        }

        const docs = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({
            url: process.env.NEXT_PUBLIC_DOCS_DOMAIN,
        });

        if (!docs.ok) {
            res.status(500).send({
                success: false,
                message: "Unexpected error while fetching docs definition",
            });
            return;
        }

        const docsDefinition = docs.body.definition;

        type ApiDefinition = FdrAPI.api.v1.read.ApiDefinition;
        const resolver = new PathResolver({
            definition: {
                apis: docsDefinition.apis as Record<ApiDefinition["id"], ApiDefinition>,
                docsConfig: docsDefinition.config,
            },
        });

        const results: Result[] = await Promise.all(
            fullSlugs.map(async (fullSlug) => {
                const navigatable = resolver.resolveNavigatable(fullSlug);
                if (navigatable == null || navigatable.type !== "page") {
                    return { fullSlug, serializedMdxContent: null };
                }
                const content = docsDefinition.pages[navigatable.page.id];
                if (content == null) {
                    return { fullSlug, serializedMdxContent: null };
                }
                const serializedMdxContent = await serializeMdxContent(content.markdown);
                return { fullSlug, serializedMdxContent };
            })
        );
        const resultsByFullSlug = results.reduce<Record<FullSlug, SerializedMdxContent | null>>((acc, result) => {
            acc[result.fullSlug] = result.serializedMdxContent;
            return acc;
        }, {});

        res.status(200).send({
            success: true,
            results: resultsByFullSlug,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error.";
        // eslint-disable-next-line no-console
        console.error("Failed to serialize page mdx due to an unexpected error:", message);
        res.status(500).send({
            success: false,
            message: "Failed to serialize: " + message,
        });
    }
};

export default handler;
