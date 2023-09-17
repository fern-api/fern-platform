import { FdrApplication, type FdrConfig } from "../app";
import { type AlgoliaSearchRecord, type AlgoliaService } from "../services/algolia";
import { type AuthService } from "../services/auth";
import { FailedToRegisterDocsNotification, SlackService } from "../services/slack/SlackService";

class MockAlgoliaService implements AlgoliaService {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async deleteIndex(_indexName: string): Promise<void> {
        return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async scheduleIndexDeletion(_indexName: string): Promise<void> {
        return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async clearIndexRecords(_indexName: string): Promise<void> {
        return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async saveIndexRecords(_indexName: string, _records: AlgoliaSearchRecord[]): Promise<void> {
        return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async saveIndexSettings(_indexName: string): Promise<void> {
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

export function createMockFdrApplication() {
    return new FdrApplication(createMockFdrConfig(), {
        auth: new MockAuthService(),
        algolia: new MockAlgoliaService(),
        slack: new MockSlackService(),
    });
}
