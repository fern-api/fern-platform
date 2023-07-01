import { AlgoliaServiceImpl, type AlgoliaService } from "src/services/AlgoliaService";
import { AuthServiceImpl, type AuthService } from "../services/AuthService";
import { DatabaseServiceImpl, type DatabaseService } from "../services/DatabaseService";
import { S3ServiceImpl, type S3Service } from "../services/S3Service";
import type { FdrConfig } from "./FdrConfig";

export interface FdrServices {
    readonly auth: AuthService;
    readonly db: DatabaseService;
    readonly algolia: AlgoliaService;
    readonly s3: S3Service;
}

export class FdrApplication {
    public readonly services: FdrServices;

    public constructor(public readonly config: FdrConfig, services?: Partial<FdrServices>) {
        this.services = {
            auth: services?.auth ?? new AuthServiceImpl(this),
            db: services?.db ?? new DatabaseServiceImpl(),
            algolia: services?.algolia ?? new AlgoliaServiceImpl(this),
            s3: services?.s3 ?? new S3ServiceImpl(this),
        };
    }
}
