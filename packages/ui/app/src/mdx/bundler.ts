import { BUNDLERS } from "./bundlers";
import type { BundledMDX, FernSerializeMdxOptions, MdxEngine, SerializeMdxFunc } from "./types";

let currentEngine: MdxEngine = "next-mdx-remote";

export async function getMdxBundler(): Promise<SerializeMdxFunc> {
    return await BUNDLERS[currentEngine]();
}

export async function setMdxBundler(engine: MdxEngine): Promise<void> {
    if (currentEngine !== engine) {
        currentEngine = engine;
    }
    await getMdxBundler();
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
