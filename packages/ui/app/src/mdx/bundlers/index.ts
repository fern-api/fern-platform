import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import { once } from "lodash-es";
import type { SerializeMdxFunc } from "../types";

const BUNDLERS: Record<FernDocs.MdxEngine, () => Promise<SerializeMdxFunc>> = {
    "mdx-bundler": once(
        (): Promise<SerializeMdxFunc> => import("./mdx-bundler").then(({ serializeMdx }) => serializeMdx),
    ),
    "next-mdx-remote": once(
        (): Promise<SerializeMdxFunc> => import("./next-mdx-remote").then(({ serializeMdx }) => serializeMdx),
    ),
};

export function getMdxBundler(engine: FernDocs.MdxEngine): Promise<SerializeMdxFunc> {
    return BUNDLERS[engine]();
}
