import { PrismaClient } from "@prisma/client";
import winston from "winston";
import { NurseryDao } from "./db/NurseryDao";

export const LOGGER = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [
        new winston.transports.Console({
            format: winston.format.json(),
        }),
    ],
});

export declare namespace NurseryApplication {
    export interface Config {
        environment: string;
    }
}

export class NurseryApplication {
    public readonly dao: NurseryDao;
    public readonly logger = LOGGER;
    public readonly config: NurseryApplication.Config;

    public constructor() {
        this.config = {
            environment: getEnvironmentVariableOrThrow("NURSERY_ENVIRONMENT"),
        };

        const prisma = new PrismaClient({
            log: ["info", "warn", "error"],
        });
        this.dao = new NurseryDao(prisma);
    }
}

function getEnvironmentVariableOrThrow(environmentVariable: string): string {
    const value = process.env[environmentVariable];
    if (value == null) {
        throw new Error(`Environment variable ${environmentVariable} not found`);
    }
    return value;
}
