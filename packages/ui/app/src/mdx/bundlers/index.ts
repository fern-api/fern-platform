import { once } from "lodash-es";
import type { MdxEngine, SerializeMdxFunc } from "../types";

export const BUNDLERS: Record<MdxEngine, () => Promise<SerializeMdxFunc>> = {
    "mdx-bundler": once(
        (): Promise<SerializeMdxFunc> => import("./mdx-bundler").then(({ serializeMdx }) => serializeMdx),
    ),
    "next-mdx-remote": once(
        (): Promise<SerializeMdxFunc> => import("./next-mdx-remote").then(({ serializeMdx }) => serializeMdx),
    ),
};
