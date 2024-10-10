import { AuthEdgeConfigSchema } from "@fern-ui/fern-docs-auth";
import { z } from "zod";

export const FeatureFlagsConfig = z.object({
    "api-playground-enabled": z.boolean().optional().default(false).describe("Enables the API playground"),
    "api-reference-paginated": z
        .boolean()
        .optional()
        .default(false)
        .describe(
            "By default, all API references are rendered in a single page. This flag forces all API references to be rendered as individual pages.",
        ),
    whitelabeled: z.boolean().optional().default(false).describe("Enables whitelabeling for the customer."),
    "seo-disabled": z.boolean().optional().default(false).describe("Sets noindex, nofollow on all pages."),
    "additional-toc-default-enabled": z
        .boolean()
        .optional()
        .default(false)
        .describe(
            "By default, the table of contents does not include accordions, steps, or tabs by default, though they can be enabled individually. Turning this flag on will enable all of them by default.",
        ),
    "snippet-template-enabled": z
        .boolean()
        .optional()
        .default(false)
        .describe("Enables evaluating snippet templates in the API playground."),
    "http-snippets-enabled": z
        .boolean()
        .optional()
        .default(false)
        .describe("Enables generating code examples in the api reference using http-snippets-lite."),
    "inline-feedback-enabled": z
        .boolean()
        .optional()
        .default(false)
        .describe("Enables the inline feedback widget, which adds a toolbar next to highlighted text."),
    "dark-code-in-light-mode": z
        .boolean()
        .optional()
        .default(false)
        .describe("Enables dark code blocks in light mode."),
    "proxy-uses-app-buildwithfern": z
        .boolean()
        .optional()
        .default(false)
        .describe("Enables the API Playground proxy to use app.buildwithfern.com instead of the current URL"),
    "image-zoom-disabled": z
        .boolean()
        .optional()
        .default(false)
        .describe("Disables the image zoom feature in the docs."),
    "use-javascript-as-typescript": z.boolean().optional().default(false).describe("Renames TypeScript to JavaScript"),
    "always-enable-javascript-fetch": z
        .boolean()
        .optional()
        .default(false)
        .describe(
            "An additional flag that will always generate a JavaScript fetch example via the http-snippets-lite plugin.",
        ),
    "use-mdx-bundler": z
        .boolean()
        .optional()
        .default(false)
        .describe("Enables the use of mdx-bundler instead of next-mdx-remote for rendering MDX content."),
    "batch-stream-toggle-disabled": z
        .boolean()
        .optional()
        .default(false)
        .describe("Disables the batch/stream toggle and renders batch and stream examples separately."),
    "enabled-auth-in-generated-docs": z
        .boolean()
        .optional()
        .default(false)
        .describe("Renders the authentication scheme in the generated docs."),
    "ai-chat-preview": z
        .boolean()
        .optional()
        .default(false)
        .describe("[Preview] Enables the conversational search plugin."),
    "audio-file-download-span-summary": z
        .boolean()
        .optional()
        .default(false)
        .describe("[Hack] Renders `audio/mpeg` in the response summary for file downloads."),
    "docs-logo-text-enabled": z
        .boolean()
        .optional()
        .default(false)
        .describe("[Hack] Renders `Docs` text next to the logo in the header."),
    "audio-example-internal": z
        .boolean()
        .optional()
        .default(false)
        .describe("[Hack] Enables rendering a hard-coded audio example in the API reference."),
    "uses-application-json-in-form-data-value": z
        .boolean()
        .optional()
        .default(false)
        .describe(
            "Most APIs assume string values in form data are application/json. This flag will actually send application/json as the content type. This affects both code snippet generation, and the actual request sent via the playground proxy",
        ),
    "binary-octet-stream-audio-player": z
        .boolean()
        .optional()
        .default(false)
        .describe("[Hack] Enables an audio player for binary/octet-stream responses."),
    "voice-id-playground-form": z
        .boolean()
        .optional()
        .default(false)
        .describe("[Hack] Enables a voice ID form in the API playground for Elevenlabs."),
    "cohere-theme": z.boolean().optional().default(false).describe("Enables the Cohere theme for the customer."),
    "file-forge-hack-enabled": z
        .boolean()
        .optional()
        .default(false)
        .describe("[Hack] Enables the file forge hack for the customer."),
    "hide-404-page": z
        .boolean()
        .optional()
        .default(false)
        .describe("Hides the 404 page and redirects to the root page."),
    "new-search-experience": z.boolean().optional().default(false).describe("Enables the new search experience."),
});

export const InkeepSettings = z.object({
    replaceSearch: z.boolean().optional().default(false),
    baseSettings: z.record(z.any()).optional(),
    aiChatSettings: z.record(z.any()).optional(),
    searchSettings: z.record(z.any()).optional(),
    modalSettings: z.record(z.any()).optional(),
});

export const LaunchDarklySettings = z.object({
    "client-side-id": z.string().optional(),
});

export const FernDocsEdgeConfigV2 = z.object({
    "feature-flags": FeatureFlagsConfig.optional(),
    authentication: AuthEdgeConfigSchema.optional(),
    inkeep: InkeepSettings.optional(),
    "launch-darkly": LaunchDarklySettings.optional(),
});

export type FernDocsEdgeConfigV2 = z.infer<typeof FernDocsEdgeConfigV2>;
