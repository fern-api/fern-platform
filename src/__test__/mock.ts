import { OrgIdsResponse } from "../services/auth/AuthService";
import { DocsV1Db } from "../api";
import { FdrApplication, type FdrConfig } from "../app";
import { type FdrServices } from "../app/FdrApplication";
import { ConfigSegmentTuple, type AlgoliaSearchRecord, type AlgoliaService } from "../services/algolia";
import { type AuthService } from "../services/auth";
import { RevalidatorService } from "../services/revalidator/RevalidatorService";
import {
    FailedToDeleteIndexSegment,
    FailedToRegisterDocsNotification,
    SlackService,
} from "../services/slack/SlackService";

class MockAlgoliaService implements AlgoliaService {
    generateSearchApiKey(_filters: string): string {
        return "";
    }

    async deleteIndexSegmentRecords(_indexSegmentIds: string[]): Promise<void> {
        return;
    }

    async generateSearchRecords(
        _docsDefinition: DocsV1Db.DocsDefinitionDb,
        _configSegmentTuples: ConfigSegmentTuple[]
    ): Promise<AlgoliaSearchRecord[]> {
        return [];
    }

    async uploadSearchRecords(_records: AlgoliaSearchRecord[]): Promise<void> {
        return;
    }
}

class MockAuthService implements AuthService {
    orgIds: string[];

    constructor({ orgIds }: { orgIds: string[] }) {
        this.orgIds = orgIds;
    }

    async checkUserBelongsToOrg(): Promise<void> {
        return;
    }

    async getOrgIdsFromAuthHeader(_authHeader: { authHeader: string | undefined }): Promise<OrgIdsResponse> {
        return {
            type: "success",
            orgIds: new Set<string>(this.orgIds),
        };
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

class MockRevalidatorService implements RevalidatorService {
    // eslint-disable-next-line no-empty-pattern
    async revalidateUrl({}: { url: string; docsConfigId: string | undefined }): Promise<void> {
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
        algoliaSearchIndex: "",
        algoliaSearchApiKey: "",
        slackToken: "",
        logLevel: "debug",
    };
}

export function createMockFdrApplication({ orgIds, services }: { orgIds?: string[]; services?: Partial<FdrServices> }) {
    return new FdrApplication(createMockFdrConfig(), {
        auth: new MockAuthService({
            orgIds: orgIds ?? [],
        }),
        algolia: new MockAlgoliaService(),
        slack: new MockSlackService(),
        revalidator: new MockRevalidatorService(),
        ...services,
    });
}
