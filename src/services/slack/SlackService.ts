import { WebClient } from "@slack/web-api";
import type { FdrApplication } from "../../app";
import { LOGGER } from "../../app/FdrApplication";

export interface FailedToRegisterDocsNotification {
    domain: string;
    err: unknown;
}

export interface SlackService {
    notifyFailedToRegisterDocs(request: FailedToRegisterDocsNotification): Promise<void>;
    notify(message: string, err: unknown): Promise<void>;
}

export class SlackServiceImpl implements SlackService {
    private client: WebClient;

    constructor(app: FdrApplication) {
        const { config } = app;
        this.client = new WebClient(config.slackToken);
    }
    async notify(message: string, err: unknown): Promise<void> {
        try {
            await this.client.chat.postMessage({
                channel: "#notifs",
                text: `:rotating_light: Encountered failure in FDR: ${message}.\n ${stringifyError(err)}`,
                blocks: [],
            });
        } catch (err) {
            LOGGER.debug("Failed to send slack message: ", err);
        }
    }

    async notifyFailedToRegisterDocs(request: FailedToRegisterDocsNotification): Promise<void> {
        try {
            await this.client.chat.postMessage({
                channel: "#notifs",
                text: `:rotating_light: Docs failed to register \`${request.domain}\`: ${stringifyError(request.err)}`,
                blocks: [],
            });
        } catch (err) {
            LOGGER.debug("Failed to send slack message: ", err);
        }
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
