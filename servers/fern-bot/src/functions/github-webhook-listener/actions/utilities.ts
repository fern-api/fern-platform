import { App } from "octokit";
import { EmitterWebhookEvent } from "@octokit/webhooks";

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
