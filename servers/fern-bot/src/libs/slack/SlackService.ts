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
