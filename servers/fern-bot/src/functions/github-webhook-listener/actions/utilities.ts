import { App } from "octokit";
import { EmitterWebhookEvent } from "@octokit/webhooks";

export interface RunId {
    // TODO: This should become some union of strings/enums of possible actions we can switch on in the check_run function
    action: "sdk_preview";
    githubRepositoryFullName: string | undefined;

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
    app,
    status,
    conclusion,
    output,
}: {
    context: EmitterWebhookEvent<"check_run">;
    app: App;
    status: CheckStatus;
    conclusion: Conclusion;
    output: CheckOutput;
}): Promise<void> {
    await app.octokit.rest.checks.update({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        owner: context.payload.repository.owner.name!,
        repo: context.payload.repository.name,
        check_run_id: context.payload.check_run.id,
        status,
        conclusion,
        output,
    });
}

export async function markCheckInProgress({
    context,
    app,
}: {
    context: EmitterWebhookEvent<"check_run">;
    app: App;
}): Promise<void> {
    await app.octokit.rest.checks.update({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        owner: context.payload.repository.owner.name!,
        repo: context.payload.repository.name,
        check_run_id: context.payload.check_run.id,
        status: "in_progress",
    });
}
