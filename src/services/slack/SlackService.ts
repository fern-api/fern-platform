import { WebClient } from "@slack/web-api";
import type { FdrApplication } from "../../app";

export interface FailedToRegisterDocsNotification {
    domain: string;
    err: unknown;
}

export interface SlackService {
    notifyFailedToRegisterDocs(request: FailedToRegisterDocsNotification): Promise<void>;
}

export class SlackServiceImpl implements SlackService {
    private client: WebClient;

    constructor(app: FdrApplication) {
        const { config } = app;
        this.client = new WebClient(config.slackToken);
    }

    async notifyFailedToRegisterDocs(request: FailedToRegisterDocsNotification): Promise<void> {
        await this.client.chat.postMessage({
            channel: "#notifs",
            text: `:rotating_light: Docs failed to register \`${request.domain}\``,
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `:rotating_light: Docs failed to register \`${request.domain}\``,
                    },
                },
                {
                    type: "divider",
                },
                {
                    type: `Here is some relevant information about the error: \`\`\`${stringifyError(
                        request.err
                    )}\`\`\``,
                },
            ],
        });
    }
}

function stringifyError(error: unknown): string {
    if (error instanceof Error) {
        const message = error.message; // Get the error message
        const stackTrace = error.stack; // Get the stack trace
        return `Error Message: ${message}\nStack Trace:\n${stackTrace}`;
    } else if (typeof error === "string") {
        return error; // If error is a string, just return it as is
    } else {
        return "An unknown error occurred";
    }
}
