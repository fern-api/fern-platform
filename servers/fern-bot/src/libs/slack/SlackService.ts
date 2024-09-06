import { WebClient } from "@slack/web-api";

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
    private addContextToHeader(header: string, organization: string, generatorName?: string): string {
        if (generatorName == null) {
            return `:fern: ${organization} - ${header} for Fern CLI`;
        }

        if (generatorName.includes("python")) {
            return `:python: ${organization} - ${header} for \`${generatorName}\``;
        } else if (generatorName.includes("typescript")) {
            return `:ts: ${organization} - ${header} for \`${generatorName}\``;
        } else if (generatorName.includes("java")) {
            return `:java: ${organization} - ${header} for \`${generatorName}\``;
        } else if (generatorName.includes("ruby")) {
            return `:ruby: ${organization} - ${header} for \`${generatorName}\``;
        } else if (generatorName.includes("csharp")) {
            return `:csharp: ${organization} - ${header} for \`${generatorName}\``;
        } else if (generatorName.includes("go")) {
            return `:gopher: ${organization} - ${header} for \`${generatorName}\``;
        } else if (generatorName.includes("php")) {
            return `:php: ${organization} - ${header} for \`${generatorName}\``;
        }

        return `:interrobang: ${header} for \`${generatorName}\``;
    }

    public async notifyUpgradePRCreated({
        fromVersion,
        toVersion,
        prUrl,
        repoName,
        generator,
        organization,
    }: {
        fromVersion: string;
        toVersion: string;
        prUrl: string;
        repoName: string;
        generator?: GeneratorMessageMetadata;
        organization: string;
    }): Promise<void> {
        await this.slackClient.chat.postMessage({
            channel: this.slackChannel,
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: this.addContextToHeader("Upgrade PR Created", organization, generator?.generatorName),
                    },
                },
                {
                    type: "divider",
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*Organization*: ${organization}\n*Github Repo:* ${repoName}${generator ? "\n" + this.getGeneratorMetadataMessage(generator) : ""}\n*Upgrading:* ${fromVersion} :arrow_right: ${toVersion}`,
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
        organization,
    }: {
        repoUrl: string;
        repoName: string;
        currentVersion: string;
        generator?: GeneratorMessageMetadata;
        organization: string;
    }): Promise<void> {
        await this.slackClient.chat.postMessage({
            channel: this.slackChannel,
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: `:rotating_light: ${this.addContextToHeader("Major version upgrade encountered", organization, generator?.generatorName)}`,
                    },
                },
                {
                    type: "divider",
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `Hey <!here>, we've encountered a major version upgrade which needs manual intervention!\n\n*Organization*: ${organization}\n*Github Repo*: ${repoName}${generator ? "\n" + this.getGeneratorMetadataMessage(generator) : ""}\n*Current version*: ${currentVersion}`,
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
