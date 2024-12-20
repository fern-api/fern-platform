import { VercelClient } from "@fern-fern/vercel";
import { writefs } from "../cwd.js";
import { assertValidEnvironment } from "../utils/valid-env.js";

interface LastDeployArgs {
    project: string;
    token: string;
    environment: string;
    output: string;
    branch?: string;
}

const GIT_COMMIT_REF = "githubCommitRef";
const GIT_COMMIT_SHA = "githubCommitSha";

export async function getLastDeployCommand({
    project,
    token,
    environment,
    branch,
    output,
}: LastDeployArgs): Promise<void> {
    assertValidEnvironment(environment);

    const vercel = new VercelClient({ token });

    const { deployments } = await vercel.deployments.getDeployments({
        projectId: project,
        limit: 1,
        state: "BUILDING,ERROR,INITIALIZING,QUEUED,READY",
        target: environment,
        branch,
    });

    const meta = deployments[0]?.meta;
    const sha = meta?.[GIT_COMMIT_SHA];
    const ref = meta?.[GIT_COMMIT_REF];

    if (sha) {
        // eslint-disable-next-line no-console
        console.log(`Last deploy ref: ${sha} (${ref ?? branch})`, deployments[0]);
        await writefs(output, sha);
    } else {
        // eslint-disable-next-line no-console
        console.error(
            `No ${environment} deployment found for project ${project} ${branch != null ? `on branch ${branch}` : ""}`,
        );
    }
}
