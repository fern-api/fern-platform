import { APIV1Db, DocsV1Db } from "../api";
import { FdrApplication, type FdrConfig } from "../app";
import { type FdrServices } from "../app/FdrApplication";
import { ConfigSegmentTuple, type AlgoliaSearchRecord, type AlgoliaService } from "../services/algolia";
import { type AuthService } from "../services/auth";
import { OrgIdsResponse } from "../services/auth/AuthService";
import { RevalidatedPathsResponse, RevalidatorService } from "../services/revalidator/RevalidatorService";
import {
    FailedToDeleteIndexSegment,
    FailedToRegisterDocsNotification,
    FailedToRevalidatePathsNotification,
    GeneratingDocsNotification,
    SlackService,
} from "../services/slack/SlackService";
import { ParsedBaseUrl } from "../util/ParsedBaseUrl";

class MockAlgoliaService implements AlgoliaService {
    generateSearchApiKey(_filters: string): string {
        return "";
    }

    async deleteIndexSegmentRecords(_indexSegmentIds: string[]): Promise<void> {
        return;
    }

    async generateSearchRecords(_: {
        docsDefinition: DocsV1Db.DocsDefinitionDb;
        apiDefinitionsById: Map<string, APIV1Db.DbApiDefinition>;
        configSegmentTuples: ConfigSegmentTuple[];
    }): Promise<AlgoliaSearchRecord[]> {
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

    async getWorkOSOrganization(_orgId: { orgId: string }): Promise<string | undefined> {
        return undefined;
    }
}

class MockSlackService implements SlackService {
    async notify(_message: string, _err: unknown): Promise<void> {
        return;
    }

    async notifyFailedToRegisterDocs(_request: FailedToRegisterDocsNotification): Promise<void> {
        return;
    }

    async notifyFailedToRevalidatePaths(_request: FailedToRevalidatePathsNotification): Promise<void> {
        return;
    }

    async notifyFailedToDeleteIndexSegment(_request: FailedToDeleteIndexSegment): Promise<void> {
        return;
    }

    async notifyGeneratedDocs(_request: GeneratingDocsNotification): Promise<void> {
        return;
    }
}

class MockRevalidatorService implements RevalidatorService {
    async revalidate(_params: { url: ParsedBaseUrl }): Promise<RevalidatedPathsResponse> {
        return {
            response: {
                successfulRevalidations: [],
                failedRevalidations: [],
            },
            revalidationFailed: false,
        };
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
        enableCustomerNotifications: false,
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
