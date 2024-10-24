import { get } from "@vercel/edge-config";
import { z } from "zod";

const PasswordAuthSchema = z.object({
    type: z.literal("password"),
    password: z.string(),
});

const PreviewUrlAuthSchema = z.discriminatedUnion("type", [
    PasswordAuthSchema,
    // Add more auth types here as needed
]);

const PreviewUrlAuthConfigSchema = z.record(PreviewUrlAuthSchema);

type PreviewUrlAuthConfig = z.infer<typeof PreviewUrlAuthConfigSchema>;

export async function getPreviewUrlAuthConfig(
    currentDomain: string,
): Promise<z.infer<typeof PreviewUrlAuthSchema> | undefined> {
    const previewDomain = isPreviewDomain(currentDomain);
    if (!previewDomain) {
        return undefined;
    }

    const config = await get<PreviewUrlAuthConfig>("authed-previews");
    return config?.[currentDomain];
}

export function isPreviewDomain(domain: string): boolean {
    const uuidRegex = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";
    return new RegExp(`^.*?${uuidRegex}\\.docs\\.buildwithfern\\.com$`).test(domain);
}
