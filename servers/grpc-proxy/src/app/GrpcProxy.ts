import winston from "winston";
import { GrpcProxyConfig } from "./GrpcProxyConfig";

export const LOGGER = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [
        new winston.transports.Console({
            format: winston.format.json(),
        }),
    ],
});

export class GrpcProxy {
    public readonly logger = LOGGER;

    public constructor(public readonly config: GrpcProxyConfig) {
        this.logger = winston.createLogger({
            level: config.logLevel,
            format: winston.format.json(),
            transports: [
                new winston.transports.Console({
                    format: winston.format.json(),
                }),
            ],
        });
    }
}
