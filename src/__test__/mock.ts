import { FdrApplication, type FdrConfig } from "../app";
import type { FdrServices } from "../app/FdrApplication";
import { type AlgoliaSearchRecord, type AlgoliaService } from "../services/algolia";
import { type AuthService } from "../services/auth";
import {
    FailedToDeleteIndexSegment,
    FailedToRegisterDocsNotification,
    SlackService,
} from "../services/slack/SlackService";

class MockAlgoliaService implements AlgoliaService {
    async deleteIndex(_indexName: string): Promise<void> {
        return;
    }

    async scheduleIndexDeletion(_indexName: string): Promise<void> {
        return;
    }

    async clearIndexRecords(_indexName: string): Promise<void> {
        return;
    }

    async saveIndexRecords(_indexName: string, _records: AlgoliaSearchRecord[]): Promise<void> {
        return;
    }

    async saveIndexSettings(_indexName: string): Promise<void> {
        return;
    }

    generateSearchApiKey(_filters: string): string {
        return "";
    }

    async deleteIndexSegmentRecords(_indexName: string, _indexSegmentIdOrIds: string | string[]): Promise<void> {
        return;
    }
}

class MockAuthService implements AuthService {
    async checkUserBelongsToOrg(): Promise<void> {
        return;
    }
}

class MockSlackService implements SlackService {
    async notify(_message: string, _err: unknown): Promise<void> {
        return;
    }

    async notifyFailedToRegisterDocs(_request: FailedToRegisterDocsNotification): Promise<void> {
        return;
    }

    async notifyFailedToDeleteIndexSegment(_request: FailedToDeleteIndexSegment): Promise<void> {
        return;
    }
}

export function createMockFdrConfig(): FdrConfig {
    return {
        awsAccessKey: "",
        awsSecretKey: "",
        s3BucketName: "fdr",
        s3BucketRegion: "us-east-1",
        venusUrl: "",
        s3UrlOverride: "http://s3-mock:9090",
        domainSuffix: ".docs.buildwithfern.com",
        algoliaAppId: "",
        algoliaAdminApiKey: "",
        slackToken: "",
    };
}

export function createMockFdrApplication(services?: Partial<FdrServices>) {
    return new FdrApplication(createMockFdrConfig(), {
        auth: new MockAuthService(),
        algolia: new MockAlgoliaService(),
        slack: new MockSlackService(),
        ...services,
    });
}
