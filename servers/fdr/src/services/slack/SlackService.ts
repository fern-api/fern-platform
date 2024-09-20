import { WebClient } from "@slack/web-api";
import winston from "winston";
import type { FdrApplication, FdrConfig } from "../../app";
import { RevalidatedPathsResponse } from "../revalidator/RevalidatorService";

export interface FailedToRegisterDocsNotification {
    domain: string;
    err: unknown;
}

export interface FailedToRevalidatePathsNotification {
    domain: string;
    paths: RevalidatedPathsResponse;
}

export interface FailedToDeleteIndexSegment {
    indexSegmentId: string;
    err: unknown;
}

export interface GeneratingDocsNotification {
    orgId: string;
    urls: string[];
}

export interface SlackService {
    notifyGeneratedDocs(request: GeneratingDocsNotification): Promise<void>;
    notifyFailedToRegisterDocs(request: FailedToRegisterDocsNotification): Promise<void>;
    notifyFailedToRevalidatePaths(request: FailedToRevalidatePathsNotification): Promise<void>;
    notifyFailedToDeleteIndexSegment(request: FailedToDeleteIndexSegment): Promise<void>;
    notify(message: string, err: unknown): Promise<void>;
}

export class SlackServiceImpl implements SlackService {
    private client: WebClient;
    private logger: winston.Logger;
    private config: FdrConfig;

    constructor(app: FdrApplication) {
        this.config = app.config;
        this.client = new WebClient(this.config.slackToken);
        this.logger = app.logger;
    }

    async notifyGeneratedDocs(request: GeneratingDocsNotification): Promise<void> {
        if (this.config.enableCustomerNotifications) {
            try {
                await this.client.chat.postMessage({
                    channel: "#customer-notifs",
                    text: `:herb: ${request.orgId} is generating docs for urls [${request.urls.join(", ")}]`,
                    blocks: [],
                });
            } catch (err) {
                this.logger.debug("Failed to send slack message: ", err);
            }
        }
    }

    async notify(message: string, err: unknown): Promise<void> {
        try {
            await this.client.chat.postMessage({
                channel: "#activity",
                text: `:rotating_light: Encountered failure in FDR: ${message}.\n ${stringifyError(err)}`,
                blocks: [],
            });
        } catch (err) {
            this.logger.debug("Failed to send slack message: ", err);
        }
    }

    async notifyFailedToRevalidatePaths(request: FailedToRevalidatePathsNotification): Promise<void> {
        try {
            const failedRevalidations = request.paths.failed;
            if (request.paths.failed.length > 0) {
                const { ts } = await this.client.chat.postMessage({
                    channel: "#engineering-notifs",
                    text: `:rotating_light: \`${request.domain}\` encountered ${failedRevalidations.length} revalidation failurs. }`,
                    blocks: [],
                });
                const failedUrlsMessage = `The following paths failed:\n ${failedRevalidations
                    .map((e) => `${(e as any).url} : ${(e as any).message}`)
                    .join("\n")}`;
                await this.client.chat.postMessage({
                    channel: "#engineering-notifs",
                    text: failedUrlsMessage,
                    thread_ts: ts,
                });
            } else if (request.paths.revalidationFailed) {
                await this.client.chat.postMessage({
                    channel: "#engineering-notifs",
                    text: `:rotating_light: \`${request.domain}\` revalidation *completely* failed.`,
                    blocks: [],
                });
            }
        } catch (err) {
            this.logger.debug("Failed to send slack message: ", err);
        }
    }

    public async notifyFailedToRegisterDocs(request: FailedToRegisterDocsNotification): Promise<void> {
        try {
            await this.client.chat.postMessage({
                channel: "#engineering-notifs",
                text: `:rotating_light: Docs failed to register \`${request.domain}\`: ${stringifyError(request.err)}`,
                blocks: [],
            });
        } catch (err) {
            this.logger.debug("Failed to send slack message: ", err);
        }
    }

    public async notifyFailedToDeleteIndexSegment(request: FailedToDeleteIndexSegment): Promise<void> {
        const { indexSegmentId, err } = request;

        try {
            await this.client.chat.postMessage({
                channel: "#engineering-notifs",
                text: `:rotating_light: Failed to delete index segment \`${indexSegmentId}\`: ${stringifyError(err)}`,
                blocks: [],
            });
        } catch (err) {
            this.logger.debug("Failed to send slack message: ", err);
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
