import { withoutStaging } from "@fern-ui/fern-docs-utils";
import { get } from "@vercel/edge-config";
import { DeepReadonly } from "ts-essentials";
import { z } from "zod";
import { FernDocsEdgeConfigV2 } from "./types";

const FernDocsEdgeConfigUnion = z.union([FernDocsEdgeConfigV2, z.string().describe("Alias to another config (host)")]);
type FernDocsEdgeConfigUnion = z.infer<typeof FernDocsEdgeConfigUnion>;

async function internalGetEdgeConfig(host: string): Promise<DeepReadonly<FernDocsEdgeConfigUnion> | undefined> {
    const config = await get<FernDocsEdgeConfigV2 | string>(host);
    const parse = FernDocsEdgeConfigUnion.safeParse(config);
    if (!parse.success) {
        // TODO: log error to sentry (and alert the team)
        // eslint-disable-next-line no-console
        console.error("Failed to parse FernDocsEdgeConfig", parse.error);
    }
    return parse.data; // returns undefined if parsing failed (swallows error)
}

export async function getEdgeConfig(host: string): Promise<DeepReadonly<FernDocsEdgeConfigV2> | undefined> {
    let config = await internalGetEdgeConfig(host);

    const hostWithoutStaging = withoutStaging(host);

    if (config === undefined && hostWithoutStaging !== host) {
        config = await internalGetEdgeConfig(hostWithoutStaging);
    }

    // if config is a string, it's an alias to another config
    if (typeof config === "string") {
        return getEdgeConfig(config);
    }

    return config;
}
