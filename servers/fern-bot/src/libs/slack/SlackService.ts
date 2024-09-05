import { WebClient } from "@slack/web-api";

export interface GeneratorMessageMetadata {
    group: string;
    generatorName: string;
    apiName?: string;
}

export class SlackService {
    private slackClient: WebClient;

    constructor(
        private readonly slackToken: string,
        private readonly slackChannel: string,
    ) {
        this.slackClient = new WebClient(slackToken);
    }

    private getGeneratorMetadataMessage(generator: GeneratorMessageMetadata): string {
        return `**Generator Group:** ${generator.group}\n**Generator:** ${generator.generatorName}${generator.apiName ? `\n**API:** ${generator.apiName}` : ""}`;
    }

    // TODO: would be nice if we stored customer metadata in a DB to then add that information to this message
    private addContextToHeader(header: string, generatorName?: string): string {
        if (generatorName == null) {
            return `:fern: ${header} for Fern CLI`;
        }

        if (generatorName.includes("python")) {
            return `:python: ${header} for ${generatorName}`;
        } else if (generatorName.includes("typescript")) {
            return `:ts: ${header} for ${generatorName}`;
        } else if (generatorName.includes("java")) {
            return `:java: ${header} for ${generatorName}`;
        } else if (generatorName.includes("ruby")) {
            return `:ruby: ${header} for ${generatorName}`;
        } else if (generatorName.includes("csharp")) {
            return `:csharp: ${header} for ${generatorName}`;
        } else if (generatorName.includes("go")) {
            return `:gopher: ${header} for ${generatorName}`;
        }

        return `:interrobang: ${header} for ${generatorName}`;
    }

    public async notifyUpgradePRCreated({
        fromVersion,
        toVersion,
        prUrl,
        repoName,
        generator,
    }: {
        fromVersion: string;
        toVersion: string;
        prUrl: string;
        repoName: string;
        generator?: GeneratorMessageMetadata;
    }): Promise<void> {
        await this.slackClient.chat.postMessage({
            channel: this.slackChannel,
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: this.addContextToHeader("Upgrade PR Created", generator?.generatorName),
                    },
                },
                {
                    type: "divider",
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `**Github Repo:** ${repoName}${generator ? "\n" + this.getGeneratorMetadataMessage(generator) : ""}\n**Upgrading:** ${fromVersion} :arrow_right: ${toVersion}`,
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
    }: {
        repoUrl: string;
        repoName: string;
        currentVersion: string;
        generator?: GeneratorMessageMetadata;
    }): Promise<void> {
        await this.slackClient.chat.postMessage({
            channel: this.slackChannel,
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: `:rotating_light: ${this.addContextToHeader("Major version upgrade encountered", generator?.generatorName)}`,
                    },
                },
                {
                    type: "divider",
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `Hey <!here>, we've encountered a major version upgrade which needs manual intervention!\n\nGithub Repo: ${repoName}${generator && "\n" + this.getGeneratorMetadataMessage(generator)}\nCurrent version: ${currentVersion}`,
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
