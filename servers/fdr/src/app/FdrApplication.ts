import { PrismaClient } from "@prisma/client";
import winston from "winston";

import { FdrDao } from "../db";
import { type AlgoliaService, AlgoliaServiceImpl } from "../services/algolia";
import {
  type AlgoliaIndexSegmentDeleterService,
  AlgoliaIndexSegmentDeleterServiceImpl,
} from "../services/algolia-index-segment-deleter";
import {
  type AlgoliaIndexSegmentManagerService,
  AlgoliaIndexSegmentManagerServiceImpl,
} from "../services/algolia-index-segment-manager";
import { type AuthService, AuthServiceImpl } from "../services/auth";
import { type DatabaseService, DatabaseServiceImpl } from "../services/db";
import {
  DocsDefinitionCache,
  DocsDefinitionCacheImpl,
} from "../services/docs-cache/DocsDefinitionCache";
import LocalDocsDefinitionStore from "../services/docs-cache/LocalDocsDefinitionStore";
import RedisDocsDefinitionStore from "../services/docs-cache/RedisDocsDefinitionStore";
import {
  RevalidatorService,
  RevalidatorServiceImpl,
} from "../services/revalidator/RevalidatorService";
import { type S3Service, S3ServiceImpl } from "../services/s3";
import { SlackService, SlackServiceImpl } from "../services/slack/SlackService";
import { type FdrConfig } from "./FdrConfig";

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
  public readonly redisDatastore;

  public constructor(
    public readonly config: FdrConfig,
    services?: Partial<FdrServices>
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
      transactionOptions: {
        timeout: 15000,
        maxWait: 15000,
      },
    });

    this.services = {
      auth: services?.auth ?? new AuthServiceImpl(this),
      db: services?.db ?? new DatabaseServiceImpl(prisma),
      algolia: services?.algolia ?? new AlgoliaServiceImpl(this),
      algoliaIndexSegmentDeleter:
        services?.algoliaIndexSegmentDeleter ??
        new AlgoliaIndexSegmentDeleterServiceImpl(this),
      algoliaIndexSegmentManager:
        services?.algoliaIndexSegmentManager ??
        new AlgoliaIndexSegmentManagerServiceImpl(this),
      s3: services?.s3 ?? new S3ServiceImpl(this.config),
      slack: services?.slack ?? new SlackServiceImpl(this),
      revalidator: services?.revalidator ?? new RevalidatorServiceImpl(),
    };

    this.dao = new FdrDao(prisma);

    this.redisDatastore = config.redisEnabled
      ? new RedisDocsDefinitionStore({
          cacheEndpointUrl: `redis://${this.config.docsCacheEndpoint}`,
          clusterModeEnabled: config.redisClusteringEnabled,
        })
      : undefined;

    this.docsDefinitionCache = new DocsDefinitionCacheImpl(
      this,
      this.dao,
      new LocalDocsDefinitionStore(),
      this.redisDatastore
    );

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

  public async initialize(): Promise<void> {
    await this.docsDefinitionCache.initialize();
  }
}
