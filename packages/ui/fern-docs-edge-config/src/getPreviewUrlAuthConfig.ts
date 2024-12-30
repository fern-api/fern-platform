import { get } from "@vercel/edge-config";
import { z } from "zod";

const WorkosAuthSchema = z.object({
    type: z.literal("workos"),
    org: z.string(),
});

const PreviewUrlAuthSchema = z.discriminatedUnion("type", [
    WorkosAuthSchema,
    // Add more auth types here as needed
]);

export type PreviewUrlAuth = z.infer<typeof PreviewUrlAuthSchema>;

const PreviewUrlAuthConfigSchema = z.record(PreviewUrlAuthSchema);

type PreviewUrlAuthConfig = z.infer<typeof PreviewUrlAuthConfigSchema>;

export interface Metadata {
    isPreviewUrl: boolean;
    orgId: string;
}

export async function getPreviewUrlAuthConfig(metadata: Metadata): Promise<PreviewUrlAuth | undefined> {
    if (!metadata.isPreviewUrl) {
        return undefined;
    }
    const config = await get<PreviewUrlAuthConfig>("authed-previews");
    return config?.[metadata.orgId];
}

export function isPreviewDomain(domain: string): boolean {
    const uuidRegex = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";
    return new RegExp(`^.*?${uuidRegex}\\.docs\\.buildwithfern\\.com$`).test(domain);
}

export function extractOrgFromPreview(domain: string): string | undefined {
    const orgRegex = "^[a-zA-Z0-9-]+";
    const uuidRegex = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";
    const match = new RegExp(`^(${orgRegex})-preview-${uuidRegex}\\.docs\\.buildwithfern\\.com$`).exec(domain);
    return match ? match[1] : undefined;
}
