import { Transformer, type ApiDefinition } from "@fern-api/fdr-sdk/api-definition";
import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import { getMdxBundler } from "@fern-ui/ui/bundlers";
import { ApiDefinitionKVCache } from "./ApiDefinitionCache";

export async function resolveApiDefinitionDescriptions(
    xFernHost: string,
    apiDefinition: ApiDefinition,
    flags: { useMdxBundler: boolean },
): Promise<ApiDefinition> {
    const cache = ApiDefinitionKVCache.getInstance(xFernHost, apiDefinition.id);

    // TODO: pass in other tsx/mdx files to serializeMdx options
    const engine = flags.useMdxBundler ? "mdx-bundler" : "next-mdx-remote";
    const serializeMdx = await getMdxBundler(engine);

    // TODO: batch resolved descriptions to avoid multiple round-trip requests to KV
    const cachedTransformer = (description: FernDocs.MarkdownText, key: string) => {
        return cache.resolveDescription(description, `${engine}/${key}`, (description) => serializeMdx(description));
    };

    const transformed = await Transformer.descriptions(cachedTransformer).apiDefinition(apiDefinition);

    return transformed;
}
