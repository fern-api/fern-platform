import { DocsDefinition } from "@fern-api/fdr-sdk/dist/generated/api/resources/docs/resources/v1/resources/read";
import { APIV1Db, DocsV1Db } from "../api";
import { FdrApplication, type FdrConfig } from "../app";
import { type FdrServices } from "../app/FdrApplication";
import { ConfigSegmentTuple, type AlgoliaSearchRecord, type AlgoliaService } from "../services/algolia";
import { type AuthService } from "../services/auth";
import { OrgIdsResponse } from "../services/auth/AuthService";
import {
    RevalidatePathErrorResult,
    RevalidatePathSuccessResult,
    RevalidatorService,
} from "../services/revalidator/RevalidatorService";
import {
    FailedToDeleteIndexSegment,
    FailedToRegisterDocsNotification,
    FailedToRevalidatePathsNotification,
    SlackService,
} from "../services/slack/SlackService";

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
}

class MockRevalidatorService implements RevalidatorService {
    async revalidatePaths(_: {
        definition: Pick<DocsDefinition, "config" | "apis">;
        domains: string[];
    }): Promise<{ success: RevalidatePathSuccessResult[]; error: RevalidatePathErrorResult[] }> {
        return { success: [], error: [] };
    }

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
