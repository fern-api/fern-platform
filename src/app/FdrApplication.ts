import winston from "winston";
import { AlgoliaServiceImpl, type AlgoliaService } from "../services/algolia";
import { AlgoliaIndexDeleterServiceImpl, type AlgoliaIndexDeleterService } from "../services/algolia-index-deleter";
import { AuthServiceImpl, type AuthService } from "../services/auth";
import { DatabaseServiceImpl, type DatabaseService } from "../services/db";
import { S3ServiceImpl, type S3Service } from "../services/s3";
import { SlackService, SlackServiceImpl } from "../services/slack/SlackService";
import type { FdrConfig } from "./FdrConfig";

export interface FdrServices {
    readonly auth: AuthService;
    readonly db: DatabaseService;
    readonly algolia: AlgoliaService;
    readonly s3: S3Service;
    readonly algoliaIndexDeleter: AlgoliaIndexDeleterService;
    readonly slack: SlackService;
}

export const LOGGER = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    defaultMeta: { service: "user-service" },
    transports: [
        new winston.transports.Console({
            format: winston.format.simple(),
        }),
    ],
});

export class FdrApplication {
    public readonly services: FdrServices;
    public readonly logger = LOGGER;

    public constructor(public readonly config: FdrConfig, services?: Partial<FdrServices>) {
        this.services = {
            auth: services?.auth ?? new AuthServiceImpl(this),
            db: services?.db ?? new DatabaseServiceImpl(),
            algolia: services?.algolia ?? new AlgoliaServiceImpl(this),
            s3: services?.s3 ?? new S3ServiceImpl(this),
            algoliaIndexDeleter: services?.algoliaIndexDeleter ?? new AlgoliaIndexDeleterServiceImpl(this),
            slack: services?.slack ?? new SlackServiceImpl(this),
        };
    }
}
