import { PrismaClient } from "@prisma/client";
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import express from "express";
import winston from "winston";
import { FdrDao } from "../db";
import { AlgoliaServiceImpl, type AlgoliaService } from "../services/algolia";
import {
    AlgoliaIndexSegmentDeleterServiceImpl,
    type AlgoliaIndexSegmentDeleterService,
} from "../services/algolia-index-segment-deleter";
import {
    AlgoliaIndexSegmentManagerServiceImpl,
    type AlgoliaIndexSegmentManagerService,
} from "../services/algolia-index-segment-manager";
import { AuthServiceImpl, type AuthService } from "../services/auth";
import { DatabaseServiceImpl, type DatabaseService } from "../services/db";
import { DocsDefinitionCache, DocsDefinitionCacheImpl } from "../services/docs-cache/DocsDefinitionCache";
import { RevalidatorService, RevalidatorServiceImpl } from "../services/revalidator/RevalidatorService";
import { S3ServiceImpl, type S3Service } from "../services/s3";
import { SlackService, SlackServiceImpl } from "../services/slack/SlackService";
import type { FdrConfig } from "./FdrConfig";

export interface FdrServices {
    readonly auth: AuthService;
    readonly db: DatabaseService;
    readonly algolia: AlgoliaService;
    readonly algoliaIndexSegmentDeleter: AlgoliaIndexSegmentDeleterService;
    readonly algoliaIndexSegmentManager: AlgoliaIndexSegmentManagerService;
    readonly s3: S3Service;
    readonly slack: SlackService;
    readonly revalidator: RevalidatorService;
}

export const LOGGER = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [
        new winston.transports.Console({
            format: winston.format.json(),
        }),
    ],
});

export class FdrApplication {
    public readonly services: FdrServices;
    public readonly dao: FdrDao;
    public readonly docsDefinitionCache: DocsDefinitionCache;
    public readonly logger = LOGGER;

    public constructor(
        public readonly config: FdrConfig,
        public readonly router: express.Router,
        services?: Partial<FdrServices>,
    ) {
        this.logger = winston.createLogger({
            level: config.logLevel,
            format: winston.format.json(),
            transports: [
                new winston.transports.Console({
                    format: winston.format.json(),
                }),
            ],
        });
        const prisma = new PrismaClient({
            log: ["info", "warn", "error"],
        });

        // ========= Init Sentry =========
        Sentry.init({
            dsn: "https://ca7d28b81fee41961a6f9f3fb59dfa8a@o4507138224160768.ingest.us.sentry.io/4507148234522624",
            integrations: [
                // enable HTTP calls tracing
                new Sentry.Integrations.Http({ tracing: true }),
                // enable Express.js middleware tracing
                new Sentry.Integrations.Express({ app: router }),
                new Sentry.Integrations.Prisma({ client: prisma }),
                nodeProfilingIntegration(),
            ],
            // Performance Monitoring
            tracesSampleRate: 1.0, //  Capture 100% of the transactions
            // Set sampling rate for profiling - this is relative to tracesSampleRate
            profilesSampleRate: 1.0,
            environment: process?.env.APPLICATION_ENVIRONMENT ?? "local",
            maxValueLength: 1000,
            debug: true,
        });

        this.services = {
            auth: services?.auth ?? new AuthServiceImpl(this),
            db: services?.db ?? new DatabaseServiceImpl(prisma),
            algolia: services?.algolia ?? new AlgoliaServiceImpl(this),
            algoliaIndexSegmentDeleter:
                services?.algoliaIndexSegmentDeleter ?? new AlgoliaIndexSegmentDeleterServiceImpl(this),
            algoliaIndexSegmentManager:
                services?.algoliaIndexSegmentManager ?? new AlgoliaIndexSegmentManagerServiceImpl(this),
            s3: services?.s3 ?? new S3ServiceImpl(this),
            slack: services?.slack ?? new SlackServiceImpl(this),
            revalidator: services?.revalidator ?? new RevalidatorServiceImpl(),
        };
        this.dao = new FdrDao(prisma);
        this.docsDefinitionCache = new DocsDefinitionCacheImpl(this, this.dao);

        if ("prepareStackTrace" in Error) {
            Error.prepareStackTrace = (err, stack) =>
                JSON.stringify({
                    message: err.message,
                    stack: stack.map((frame) => ({
                        file: frame.getFileName(),
                        function: frame.getFunctionName(),
                        column: frame.getColumnNumber(),
                        line: frame.getLineNumber(),
                    })),
                });
        }
    }
}
