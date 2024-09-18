import { VercelProjectSettings } from "@/projects/schema.js";
import { Vercel } from "@fern-fern/vercel";
import { Prettify } from "ts-essentials";
import { vercel } from "./client.js";
import { getVercelTeamId } from "./env.js";

const NODE_VERSION = "18.x" as const;
const REGION = "iad1" as const;

export async function applyProjectSettings(
    name: string,
    settings: VercelProjectSettings,
): Promise<Vercel.UpdateProjectResponse> {
    return await vercel.projects.updateProject(name, {
        teamId: getVercelTeamId(),
        rootDirectory: settings.rootDirectory,
        nodeVersion: NODE_VERSION,
        serverlessFunctionRegion: REGION,
        autoExposeSystemEnvs: true,
        autoAssignCustomDomains: false,
        directoryListing: false,
        gitForkProtection: true,
        gitLfs: false,
        publicSource: false,
        sourceFilesOutsideRootDirectory: true,
        enablePreviewFeedback: true,
        enableProductionFeedback: settings.dev ?? false,
        enableAffectedProjectsDeployments: false,
        customerSupportCodeVisibility: false,
    } satisfies Prettify<Vercel.UpdateProjectRequest>);
}

export async function getProjectSettings(): Promise<void> {
    const project = await vercel.projects.getProject("app.buildwithfern.com");
    // eslint-disable-next-line no-console
    console.log(project);
}
