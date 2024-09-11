import { captureSentryError } from "../analytics/sentry";
import { serializeMdx as defaultSerializeMdx } from "./bundlers/next-mdx-remote";
import type { BundledMDX, FernSerializeMdxOptions, SerializeMdxFunc } from "./types";

let currentEngine: SerializeMdxFunc = defaultSerializeMdx;

export async function getMdxBundler(): Promise<SerializeMdxFunc> {
    return currentEngine;
}

export function setMdxBundler(engine: SerializeMdxFunc): void {
    currentEngine = engine;
}

export async function unsafeSerializeMdx(content: string, options?: FernSerializeMdxOptions): Promise<BundledMDX>;
export async function unsafeSerializeMdx(
    content: string | undefined,
    options?: FernSerializeMdxOptions,
): Promise<BundledMDX | undefined>;
export async function unsafeSerializeMdx(
    content: string | undefined,
    options: FernSerializeMdxOptions = {},
): Promise<BundledMDX | undefined> {
    if (content == null || content.trim().length === 0) {
        return content;
    }

    const bundler = await getMdxBundler();
    return bundler(content, options);
}

export async function serializeMdx(content: string, options?: FernSerializeMdxOptions): Promise<BundledMDX>;
export async function serializeMdx(
    content: string | undefined,
    options?: FernSerializeMdxOptions,
): Promise<BundledMDX | undefined>;
export async function serializeMdx(
    content: string | undefined,
    options: FernSerializeMdxOptions = {},
): Promise<BundledMDX | undefined> {
    try {
        return unsafeSerializeMdx(content, options);
    } catch (e) {
        captureSentryError(e, {
            context: "MDX",
            errorSource: "maybeSerializeMdxContent",
            errorDescription: "Failed to serialize MDX content",
        });
    }
    return content;
}
