import { Env } from "@libs/env";
import { FernRegistryClient } from "@fern-fern/paged-generators-sdk";
import { PullRequestState } from "@fern-fern/generators-sdk/api";
import { PullRequest } from "@fern-fern/paged-generators-sdk/api";
import { SlackService } from "@libs/slack/SlackService";

const STALE_IN_DAYS = 7;
const VERBOSE_MESSAGE_THRESHOLD = 5;
const FERN_TEAM = new Set<string>([
    "abvthecity",
    "amckinney",
    "armandobelardo",
    "rohinbhargava",
    "dsinghvi",
    "dcb6",
    "chdeskur",
    "dannysheridan",
    "fern-bot",
]);
// We don't care about notifying for our own orgs
const EXCLUDE_ORGS = new Set<string>(["fern-api", "fern-demo"]);

export async function sendStaleNotificationsInternal(env: Env): Promise<void> {
    const client = new FernRegistryClient({ environment: env.DEFAULT_FDR_ORIGIN, token: env.FERN_TOKEN });
    const botPulls = await client.git.listPullRequests({
        // Is the author any fern member, or the github app?
        author: [env.GITHUB_APP_LOGIN_NAME],
        state: [PullRequestState.Open, PullRequestState.Closed],
    });

    const orgPullMap = new Map<string, PullRequest[]>();
    for await (const pull of botPulls) {
        if (pull.createdAt < new Date(Date.now() - STALE_IN_DAYS * 24 * 60 * 60 * 1000)) {
            orgPullMap.set(pull.repositoryOwner, [...(orgPullMap.get(pull.repositoryOwner) || []), pull]);
        }
    }

    // Notify stale upgrade PRs to CUSTOMER_ALERTS_SLACK_CHANNEL
    const upgradesSlackClient = new SlackService(env.FERNIE_SLACK_APP_TOKEN, env.CUSTOMER_ALERTS_SLACK_CHANNEL);
    for (const [org, pulls] of orgPullMap) {
        if (EXCLUDE_ORGS.has(org)) {
            continue;
        }

        let maybeApiSpecPull: PullRequest | undefined;
        const versionUpdatePulls: PullRequest[] = [];
        for (const pull of pulls) {
            if (pull.title.includes("Update API Spec")) {
                maybeApiSpecPull = pull;
            } else {
                versionUpdatePulls.push(pull);
            }
        }
        if (maybeApiSpecPull != null || versionUpdatePulls.length > 0) {
            const allPulls = versionUpdatePulls.concat(maybeApiSpecPull ? [maybeApiSpecPull] : []);
            const aPull = allPulls[0];
            upgradesSlackClient.notifyStaleUpgradePRs({
                organization: org,
                apiSpecPull: maybeApiSpecPull,
                versionUpdatePulls,
                // We only call this function if there's at least one PR so this should be safe
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                repoName: `${aPull!.repositoryOwner}/${aPull!.repositoryName}`,
                retoolLink: "TODO",
                // Truncate the messages if we're going to be writing a lot of them
                shouldBeVerbose: versionUpdatePulls.length <= VERBOSE_MESSAGE_THRESHOLD,
            });
        }
    }

    const teamPulls = await client.git.listPullRequests({
        // Is the author any fern member, or the github app?
        author: Array.from(FERN_TEAM.values()),
        state: [PullRequestState.Open, PullRequestState.Closed],
    });
    const teamPullsSlackClient = new SlackService(env.FERNIE_SLACK_APP_TOKEN, env.CUSTOMER_PULLS_SLACK_CHANNEL);
    // Notify on any PRs opened by us to CUSTOMER_PULLS_SLACK_CHANNEL
    let numStaleTeamPulls = 0;
    for await (const pull of teamPulls) {
        if (EXCLUDE_ORGS.has(pull.repositoryOwner)) {
            continue;
        }
        if (pull.createdAt < new Date(Date.now() - STALE_IN_DAYS * 24 * 60 * 60 * 1000)) {
            numStaleTeamPulls++;
        }
    }
    if (numStaleTeamPulls > 0) {
        teamPullsSlackClient.notifyStaleTeamPulls({ numStaleTeamPulls, retoolLink: "TODO" });
    }
}

// The below seems to not be possible with installation auth/a github app, so we'd need to use a personal access token
// which feels a bit jank right now, so just hardcoding the list above instead.
//
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
