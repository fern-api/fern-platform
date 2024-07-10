import { serializeMdx as defaultSerializeMdx } from "./bundlers/next-mdx-remote";
import type { BundledMDX, FernSerializeMdxOptions, SerializeMdxFunc } from "./types";

let currentEngine: SerializeMdxFunc = defaultSerializeMdx;

export async function getMdxBundler(): Promise<SerializeMdxFunc> {
    return currentEngine;
}

export function setMdxBundler(engine: SerializeMdxFunc): void {
    currentEngine = engine;
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
    const bundler = await getMdxBundler();
    return bundler(content, options);
}
