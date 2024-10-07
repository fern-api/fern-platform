import { FernRegistryClient } from "@fern-fern/paged-generators-sdk";
import { execFernCli, getPreviewPath } from "@libs/fern";
import { cloneRepo, configureGit } from "@libs/github";
import { EmitterWebhookEvent } from "@octokit/webhooks";
import { markCheckInProgress, updateCheck, RunId } from "./utilities";
import { Octokit } from "octokit";
import { runScript } from "@libs/execaUtils";

// We want to:
//  1. Update the status to in_progress
//  2. Pull the config repo
//  3. Run `fern generate --preview --group ${} --generator ${} --api ${}`
//  4. Kick off the checks (from generator CRUD API)
//  5. If there's a repo, push a branch to that repo
//  6. Complete the action with the checks status
//    6a. Include detailed logs in the `output` block
export async function previewSdk({
    context,
    installationOctokit,
    fernBotLoginName,
    fernBotLoginId,
    runId,
    fdrUrl,
}: {
    context: EmitterWebhookEvent<"check_run">;
    installationOctokit: Octokit;
    fernBotLoginName: string;
    fernBotLoginId: string;
    runId: RunId;
    fdrUrl: string;
}): Promise<void> {
    // Tell github we're working on this now
    await markCheckInProgress({ context, installationOctokit });

    // ==== DO THE ACTUAL ACTION ====
    const fdrClient = new FernRegistryClient({ environment: fdrUrl });
    const { generatorDockerImage, groupName, apiName } = runId;
    const repository = context.payload.repository;
    const [git, fullRepoPath] = await configureGit(repository);
    // Get the config repo
    await cloneRepo(git, repository, installationOctokit, fernBotLoginName, fernBotLoginId);
    // Generate preview
    let previewCommand = `generate --preview --group ${groupName} --log-level debug`;
    if (apiName != null) {
        previewCommand += ` --api ${apiName}`;
    }
    await execFernCli(previewCommand, fullRepoPath, true);
    // Kick off the checks + compile a summary
    const generatorEntity = await fdrClient.generators.getGeneratorByImage({ dockerImage: generatorDockerImage });
    if (generatorEntity == null || generatorEntity.scripts == null) {
        await runDefaultAction({ context, installationOctokit });
        return;
    }
    const { preInstallScript, installScript, compileScript, testScript } = generatorEntity.scripts;

    const previewPath = await getPreviewPath({
        generatorDockerImage,
        currentRepoPath: fullRepoPath,
        apiName,
    });

    let details: string | undefined;
    let totalTasks = 0;
    let failedTasks = 0;
    if (preInstallScript != null) {
        if (details == null) {
            details = "";
        }
        totalTasks++;
        const [log, didFail] = await runScriptAndCollectOutput(preInstallScript.steps, "Setup", previewPath);
        if (didFail) {
            failedTasks++;
        }
        details += log + "\n\n";
    }
    if (installScript != null) {
        if (details == null) {
            details = "";
        }
        totalTasks++;
        const [log, didFail] = await runScriptAndCollectOutput(installScript.steps, "Install", previewPath);
        if (didFail) {
            failedTasks++;
        }
        details += log + "\n\n";
    }
    if (compileScript != null) {
        if (details == null) {
            details = "";
        }
        totalTasks++;
        const [log, didFail] = await runScriptAndCollectOutput(compileScript.steps, "Compile", previewPath);
        if (didFail) {
            failedTasks++;
        }
        details += log + "\n\n";
    }
    if (testScript != null) {
        if (details == null) {
            details = "";
        }
        totalTasks++;
        const [log, didFail] = await runScriptAndCollectOutput(testScript.steps, "Test", previewPath);
        if (didFail) {
            failedTasks++;
        }
        details += log + "\n\n";
    }
    // ====== ACTION COMPLETE ======

    // Tell github we're done and deliver the deets
    const titleLanguage =
        generatorEntity.generatorLanguage && generatorEntity.generatorLanguage.length > 0
            ? // Try capitalizing the language to make it look a little nicer
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              generatorEntity.generatorLanguage[0]!.toUpperCase() + generatorEntity.generatorLanguage.slice(1)
            : "SDK";
    await updateCheck({
        context,
        installationOctokit,
        status: "completed",
        conclusion: failedTasks > 0 ? "failure" : "success",
        output: {
            title: `🌱 ${titleLanguage} Preview Checks - ${failedTasks}/${totalTasks} ${failedTasks > 0 ? "❌" : "✅"}`,
            summary: "",
            text: details,
        },
    });
}

async function runScriptAndCollectOutput(
    commands: string[],
    sectionTitle: string,
    workingDir: string,
): Promise<[string, boolean]> {
    let outputs: string = "";
    let didFail = false;

    for (const command of commands) {
        console.log(`[Preview] Running command: ${command} at workingDir: ${workingDir} `);
        // Write the command
        if (outputs !== "") {
            outputs += "\n\n\n";
        }
        outputs += `> $ ${command}\n\n`;
        const out = await runScript({
            commands,
            workingDir,
        });
        if (out.exitCode != 0) {
            didFail = true;
        }

        if (out.all != null) {
            // Write the logs
            outputs += out.all;
        }
    }

    let log = `**${sectionTitle}** - ${didFail ? "❌" : "✅"}\n\n`;
    if (outputs != "") {
        log += `\`\`\`bash\n${outputs}\n\`\`\``;
    }
    return [log, didFail];
}

export async function runDefaultAction({
    context,
    installationOctokit,
}: {
    context: EmitterWebhookEvent<"check_run">;
    installationOctokit: Octokit;
}): Promise<void> {
    await updateCheck({
        context,
        installationOctokit,
        status: "completed",
        conclusion: "neutral",
        output: {
            title: "No checks run",
            summary: "🌱 No checks were run as a result of this commit 🚫",
            text: undefined,
        },
    });
}
