import { FernRegistryClient } from "@fern-fern/paged-generators-sdk";
import { PullRequest, PullRequestState } from "@fern-fern/paged-generators-sdk/api";
import { Env } from "@libs/env";
import { SlackService } from "@libs/slack/SlackService";

const STALE_IN_DAYS = 7;
const STALE_IN_MS = STALE_IN_DAYS * 24 * 60 * 60 * 1000;
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
        state: [PullRequestState.Open],
    });

    const orgPullMap = new Map<string, PullRequest[]>();
    let staleBotPRsFound = false;
    for await (const pull of botPulls) {
        if (env.ENVIRONMENT !== "development" && EXCLUDE_ORGS.has(pull.repositoryOwner)) {
            continue;
        }

        if (pull.createdAt < new Date(Date.now() - STALE_IN_MS)) {
            orgPullMap.set(pull.repositoryOwner, [...(orgPullMap.get(pull.repositoryOwner) || []), pull]);
            staleBotPRsFound = true;
        }
    }

    // Notify stale upgrade PRs to CUSTOMER_ALERTS_SLACK_CHANNEL
    const upgradesSlackClient = new SlackService(env.FERNIE_SLACK_APP_TOKEN, env.CUSTOMER_ALERTS_SLACK_CHANNEL);
    for (const [org, pulls] of orgPullMap) {
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
                repoName: `${aPull?.repositoryOwner}/${aPull?.repositoryName}`,
                retoolLink: "https://buildwithfern.retool.com/apps/703271ca-7777-11ef-aecd-ab097775918e/Stale%20Pulls",
                // Truncate the messages if we're going to be writing a lot of them
                shouldBeVerbose: versionUpdatePulls.length <= VERBOSE_MESSAGE_THRESHOLD,
            });
        }
    }
    if (!staleBotPRsFound) {
        console.log("No stale fern-bot PRs found");
    }

    const teamPulls = await client.git.listPullRequests({
        // Is the author any fern member, or the github app?
        author: Array.from(FERN_TEAM.values()),
        state: [PullRequestState.Open],
    });
    const teamPullsSlackClient = new SlackService(env.FERNIE_SLACK_APP_TOKEN, env.CUSTOMER_PULLS_SLACK_CHANNEL);
    // Notify on any PRs opened by us to CUSTOMER_PULLS_SLACK_CHANNEL
    let numStaleTeamPulls = 0;
    for await (const pull of teamPulls) {
        if (env.ENVIRONMENT !== "development" && EXCLUDE_ORGS.has(pull.repositoryOwner)) {
            continue;
        }
        if (pull.createdAt < new Date(Date.now() - STALE_IN_MS)) {
            numStaleTeamPulls++;
        }
    }
    if (numStaleTeamPulls > 0) {
        teamPullsSlackClient.notifyStaleTeamPulls({
            numStaleTeamPulls,
            retoolLink: "https://buildwithfern.retool.com/apps/703271ca-7777-11ef-aecd-ab097775918e/Stale%20Pulls",
        });
    } else {
        console.log("No stale team PRs found");
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
