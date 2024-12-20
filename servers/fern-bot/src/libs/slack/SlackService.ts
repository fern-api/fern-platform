import { PullRequest } from "@fern-fern/paged-generators-sdk/api";
import { KnownBlock, SectionBlock, WebClient } from "@slack/web-api";

export interface GeneratorMessageMetadata {
    group: string;
    generatorName: string;
    apiName?: string;
}

export class SlackService {
    private slackClient: WebClient;

    constructor(
        slackToken: string,
        private readonly slackChannel: string,
    ) {
        this.slackClient = new WebClient(slackToken);
    }

    private getGeneratorMetadataMessage(generator: GeneratorMessageMetadata): string {
        return `*Generator Group:* ${generator.group}\n*Generator:* ${generator.generatorName}${generator.apiName ? `\n*API:* ${generator.apiName}` : ""}`;
    }

    // TODO: would be nice if we stored customer metadata in a DB to then add that information to this message
    private addContextToHeader(header: string, maybeOrganization: string | undefined, generatorName?: string): string {
        if (generatorName == null) {
            return `:fern: ${this.getOrganizationName(maybeOrganization, true)} - ${header} for Fern CLI`;
        }

        if (generatorName.includes("python")) {
            return `:python: ${this.getOrganizationName(maybeOrganization, true)} - ${header} for \`${generatorName}\``;
        } else if (generatorName.includes("typescript")) {
            return `:ts: ${this.getOrganizationName(maybeOrganization, true)} - ${header} for \`${generatorName}\``;
        } else if (generatorName.includes("java")) {
            return `:java: ${this.getOrganizationName(maybeOrganization, true)} - ${header} for \`${generatorName}\``;
        } else if (generatorName.includes("ruby")) {
            return `:ruby: ${this.getOrganizationName(maybeOrganization, true)} - ${header} for \`${generatorName}\``;
        } else if (generatorName.includes("csharp")) {
            return `:csharp: ${this.getOrganizationName(maybeOrganization, true)} - ${header} for \`${generatorName}\``;
        } else if (generatorName.includes("go")) {
            return `:gopher: ${this.getOrganizationName(maybeOrganization, true)} - ${header} for \`${generatorName}\``;
        } else if (generatorName.includes("php")) {
            return `:php: ${this.getOrganizationName(maybeOrganization, true)} - ${header} for \`${generatorName}\``;
        }

        return `:interrobang: ${header} for \`${generatorName}\``;
    }

    getOrganizationName(organization: string | undefined, inTitle?: boolean): string {
        if (inTitle) {
            return organization ? organization : "No Org";
        } else {
            return organization ? organization : "Org Not Found (you may need that CLI upgrade)";
        }
    }

    public async notifyStaleTeamPulls({
        numStaleTeamPulls,
        retoolLink,
    }: {
        numStaleTeamPulls: number;
        retoolLink: string;
    }): Promise<void> {
        await this.slackClient.chat.postMessage({
            channel: this.slackChannel,
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: `:sleeping: :fernie: There are ${numStaleTeamPulls} stale PRs opened by Fern team members`,
                    },
                },
                {
                    type: "actions",
                    block_id: "actions1",
                    elements: [
                        {
                            type: "button",
                            text: {
                                type: "plain_text",
                                text: "View in Retool :control_knobs:",
                            },
                            url: retoolLink,
                        },
                    ],
                },
            ],
        });
    }

    // :sleeping: <organization> has stale upgrade PRs
    // Organization: courier
    // Github Repo: trycourier/courier-api
    // API Spec Update PR: #123
    // Version Update PRs: #124, #125, [...] (overflow)
    // [View in Retool <link>]
    //
    // OR if there are too many
    //
    // :sleeping: <organization> has 10 stale upgrade PRs
    // [View Pulls <link>] [View in Retool <link>]
    public async notifyStaleUpgradePRs({
        versionUpdatePulls,
        apiSpecPull,
        organization,
        repoName,
        retoolLink,
        shouldBeVerbose,
    }: {
        organization: string;
        repoName: string;
        versionUpdatePulls: PullRequest[];
        apiSpecPull?: PullRequest;
        retoolLink: string;
        shouldBeVerbose: boolean;
    }): Promise<void> {
        const verboseBlocks: KnownBlock[] = [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: `:sleeping: ${organization} has stale upgrade PRs`,
                },
            },
            {
                type: "divider",
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*Organization*: ${this.getOrganizationName(organization)}\n*Github Repo:* ${repoName}${this.getStaleAPISpecPRMessage(apiSpecPull)}`,
                },
            },
        ];

        const maybeVersionUpdateMessage = this.getStaleVersionUpgradePRsMessage(versionUpdatePulls);
        if (maybeVersionUpdateMessage != null) {
            verboseBlocks.push(maybeVersionUpdateMessage);
        }

        verboseBlocks.push({
            type: "actions",
            block_id: "actions1",
            elements: [
                {
                    type: "button",
                    text: {
                        type: "plain_text",
                        text: "View in Retool :control_knobs:",
                    },
                    url: retoolLink,
                },
            ],
        });

        const allPulls = versionUpdatePulls.concat(apiSpecPull ? [apiSpecPull] : []);
        const aPull = allPulls[0];
        // TODO: we should maybe add the repo to the pull, or at least this link so we don't
        // have to do this sketchy string replace, but rather have the pulls URL on the pull
        // NOTE: The pulls URL is not the link to the specific PR, but the link to the PRs page
        //
        // We only call this function if there's at least one PR so this should be safe
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const pullsLink = aPull!.url.replace(aPull!.pullRequestNumber.toString(), "");
        await this.slackClient.chat.postMessage({
            channel: this.slackChannel,
            blocks: shouldBeVerbose
                ? verboseBlocks
                : [
                      {
                          type: "header",
                          text: {
                              type: "plain_text",
                              text: `:sleeping: ${organization} has ${versionUpdatePulls.length} stale upgrade PRs ${apiSpecPull ? "and a stale API Spec PR" : ""}`,
                          },
                      },
                      {
                          type: "actions",
                          block_id: "actions1",
                          elements: [
                              {
                                  type: "button",
                                  text: {
                                      type: "plain_text",
                                      text: "View Pulls :link:",
                                  },
                                  url: pullsLink,
                              },
                              {
                                  type: "button",
                                  text: {
                                      type: "plain_text",
                                      text: "View in Retool :control_knobs:",
                                  },
                                  url: retoolLink,
                              },
                          ],
                      },
                  ],
        });
    }

    getStaleAPISpecPRMessage(apiSpecPull: PullRequest | undefined): string {
        return apiSpecPull ? `\n*API Spec Update PR:* ${this.linkPR(apiSpecPull)}` : "";
    }

    getStaleVersionUpgradePRsMessage(versionUpdatePulls: PullRequest[]): SectionBlock | undefined {
        if (versionUpdatePulls.length > 0) {
            let message = "*Version Update PRs:*";
            // Inline the first 3 PRs
            for (const pull of versionUpdatePulls.slice(2)) {
                message += ` ${this.linkPR(pull)}`;
            }

            if (versionUpdatePulls.length > 3) {
                return {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: message,
                    },
                    accessory: {
                        type: "overflow",
                        // Slack limits options to 5, so only going up to 8 total PRs linked, including the inlined ones
                        options: versionUpdatePulls.slice(3, 8).map((pull) => ({
                            text: {
                                type: "plain_text",
                                text: pull.title,
                            },
                            description: {
                                type: "plain_text",
                                text: `#${pull.pullRequestNumber}`,
                            },
                            url: pull.url,
                            value: "placeholder",
                        })),
                        action_id: "overflow_prs",
                    },
                };
            }
            return {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: message,
                },
            };
        }
        return;
    }

    linkPR(pull: PullRequest): string {
        return `<${pull.url}|#${pull.pullRequestNumber}>`;
    }

    public async notifyUpgradePRCreated({
        fromVersion,
        toVersion,
        prUrl,
        repoName,
        generator,
        maybeOrganization,
    }: {
        fromVersion: string;
        toVersion: string;
        prUrl: string;
        repoName: string;
        generator?: GeneratorMessageMetadata;
        maybeOrganization: string | undefined;
    }): Promise<void> {
        await this.slackClient.chat.postMessage({
            channel: this.slackChannel,
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: this.addContextToHeader(
                            "Upgrade PR Created",
                            maybeOrganization,
                            generator?.generatorName,
                        ),
                    },
                },
                {
                    type: "divider",
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*Organization*: ${this.getOrganizationName(maybeOrganization)}\n*Github Repo:* ${repoName}${generator ? "\n" + this.getGeneratorMetadataMessage(generator) : ""}\n*Upgrading:* ${fromVersion} :arrow_right: ${toVersion}`,
                    },
                },
                {
                    type: "actions",
                    block_id: "actions1",
                    elements: [
                        {
                            type: "button",
                            text: {
                                type: "plain_text",
                                text: "View PR :link:",
                            },
                            url: prUrl,
                        },
                    ],
                },
            ],
        });
    }

    public async notifyMajorVersionUpgradeEncountered({
        repoUrl,
        repoName,
        currentVersion,
        generator,
        maybeOrganization,
    }: {
        repoUrl: string;
        repoName: string;
        currentVersion: string;
        generator?: GeneratorMessageMetadata;
        maybeOrganization: string | undefined;
    }): Promise<void> {
        await this.slackClient.chat.postMessage({
            channel: this.slackChannel,
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: `:rotating_light: ${this.addContextToHeader("Major version upgrade encountered", maybeOrganization, generator?.generatorName)}`,
                    },
                },
                {
                    type: "divider",
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `Hey <!here>, we've encountered a major version upgrade which needs manual intervention!\n\n*Organization*: ${this.getOrganizationName(maybeOrganization)}\n*Github Repo*: ${repoName}${generator ? "\n" + this.getGeneratorMetadataMessage(generator) : ""}\n*Current version*: ${currentVersion}`,
                    },
                },
                {
                    type: "actions",
                    block_id: "actions1",
                    elements: [
                        {
                            type: "button",
                            text: {
                                type: "plain_text",
                                text: "Visit Repo :link:",
                            },
                            url: repoUrl,
                        },
                    ],
                },
            ],
        });
    }
}
