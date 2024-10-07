import { EmitterWebhookEvent } from "@octokit/webhooks";
import { Octokit } from "octokit";

export interface RunId {
    // TODO: This should become some union of strings/enums of possible actions we can switch on in the check_run function
    action: "sdk_preview";

    // Also the docker image for the generator
    generatorDockerImage: string;
    groupName: string;
    apiName: string | undefined;
}

export function stringifyRunId(runId: RunId): string {
    return JSON.stringify(runId);
}

export function deserializeRunId(stringifiedRunId: string): RunId {
    // TODO: we should throw here if it cannot deserialize correctly
    return JSON.parse(stringifiedRunId) as RunId;
}

// Octokit isn't exporting these types
export type CheckStatus = "queued" | "in_progress" | "completed";

export type Conclusion =
    | "action_required"
    | "cancelled"
    | "failure"
    | "neutral"
    | "success"
    | "skipped"
    | "stale"
    | "timed_out";

export interface CheckOutput {
    title: string;
    summary: string;
    text: string | undefined;
}

export async function updateCheck({
    context,
    installationOctokit,
    status,
    conclusion,
    output,
}: {
    context: EmitterWebhookEvent<"check_run">;
    installationOctokit: Octokit;
    status: CheckStatus;
    conclusion: Conclusion;
    output: CheckOutput;
}): Promise<void> {
    await installationOctokit.rest.checks.update({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        check_run_id: context.payload.check_run.id,
        status,
        conclusion,
        output,
    });
}

export async function markCheckInProgress({
    context,
    installationOctokit,
}: {
    context: EmitterWebhookEvent<"check_run">;
    installationOctokit: Octokit;
}): Promise<void> {
    await installationOctokit.rest.checks.update({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        check_run_id: context.payload.check_run.id,
        status: "in_progress",
    });
}
