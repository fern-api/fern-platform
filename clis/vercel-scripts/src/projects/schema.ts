import { z } from "zod";

const ProjectNameSchema = z
    .string({ description: "Name of the project, i.e. 'app.buildwithfern.com'" })
    .regex(/^[a-z0-9.-]+$/, { message: "Project name must be lowercase alphanumeric with dashes and dots" });

export const VercelProjectSettingsSchema = z
    .object({
        rootDirectory: z.string({ description: "i.e. 'packages/ui/docs-bundle'" }),
        dev: z.boolean({ description: "Whether the project targets fdr-dev" }).optional().default(false),
    })
    .strict();

export type VercelProjectSettings = z.infer<typeof VercelProjectSettingsSchema>;

export const VercelProjectsSchema = z
    .object({
        $schema: z.string({ description: "./projects.schema.json" }),
        projects: z.record(ProjectNameSchema, VercelProjectSettingsSchema, {
            description: "Project settings keyed by project name (which is used as the Vercel app name and domain)",
        }),
    })
    .strict();
