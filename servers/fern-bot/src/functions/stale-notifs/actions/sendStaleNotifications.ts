import { Env } from "@libs/env";
import { FernRegistryClient } from "@fern-fern/generators-sdk";

// Note given we're making requests to FDR, this could take time, so we're parallelizing this function with a Map step in
// the step function, as we do for all the other actions.
export async function sendStaleNotificationsInternal(env: Env): Promise<void> {
    const client = new FernRegistryClient({ environment: env.DEFAULT_FDR_ORIGIN, token: env.FERN_TOKEN });
    const pulls = await client.git.listPullRequests({});

    // Notify on stale upgrade PRs to CUSTOMER_ALERTS_SLACK_CHANNEL

    // Notify on any PRs opened by us to CUSTOMER_PULLS_SLACK_CHANNEL
    // just show the number of PRs opened, and maybe the top repos with
    // the most PRs opened with a link to the Retool dashboard.
}

const FERN_TEAM = new Set<string>([
    "abvthecity",
    "amckinney",
    "armandobelardo",
    "rohinbhargava",
    "dsinghvi",
    "dcb6",
    "chdeskur",
    "dannysheridan",
]);
function isFernOrgMember(login: string) {
    return FERN_TEAM.has(login.toLowerCase());
}

// The below seems to not be possible with installation auth/a github app, so we'd need to use a personal access token
// which feels a bit jank right now, so just hardcoding a list instead.
// Logins for fern team members, this is effectively a cache so we're not making requests to Github for every author
// const FERN_TEAM = new Set<string>();
// async function isFernOrgMember(login: string, app: App) {
//     const membershipCheck = await app.octokit.rest.orgs.checkMembershipForUser({
//         org: "fern-api",
//         username: login,
//     });

//     if (membershipCheck.data) {
//         FERN_TEAM.add(login);
//     }

//     return membershipCheck.data;
// }
