import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import { serializeMdx as defaultSerializeMdx } from "./bundlers/next-mdx-remote";
import type { FernSerializeMdxOptions, SerializeMdxFunc } from "./types";

let currentEngine: SerializeMdxFunc = defaultSerializeMdx;

export async function getMdxBundler(): Promise<SerializeMdxFunc> {
    return currentEngine;
}

export function setMdxBundler(engine: SerializeMdxFunc): void {
    currentEngine = engine;
}

export async function serializeMdx(content: string, options?: FernSerializeMdxOptions): Promise<FernDocs.MarkdownText>;
export async function serializeMdx(
    content: string | undefined,
    options?: FernSerializeMdxOptions,
): Promise<FernDocs.MarkdownText | undefined>;
export async function serializeMdx(
    content: string | undefined,
    options: FernSerializeMdxOptions = {},
): Promise<FernDocs.MarkdownText | undefined> {
    if (content == null || content.trim().length === 0) {
        return content;
    }

    const bundler = await getMdxBundler();
    return bundler(content, options);
}

export type MDX_SERIALIZER = {
    (content: string, options?: FernSerializeMdxOptions): Promise<FernDocs.MarkdownText>;
    (content: string | undefined, options?: FernSerializeMdxOptions): Promise<FernDocs.MarkdownText | undefined>;
};
