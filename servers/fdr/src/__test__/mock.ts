import { APIV1Db, DocsV1Db } from "@fern-api/fdr-sdk";
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

export class MockAlgoliaService implements AlgoliaService {
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

    checkOrgHasSnippetsApiAccess({
        authHeader,
        orgId,
        failHard,
    }: {
        authHeader: string | undefined;
        orgId: string;
        failHard?: boolean | undefined;
    }): Promise<boolean> {
        return Promise.resolve(false);
    }

    checkOrgHasSnippetTemplateAccess({
        authHeader,
        orgId,
        failHard,
    }: {
        authHeader: string | undefined;
        orgId: string;
        failHard?: boolean | undefined;
    }): Promise<boolean> {
        return Promise.resolve(false);
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
    async revalidate(_params: { baseUrl: ParsedBaseUrl }): Promise<RevalidatedPathsResponse> {
        return {
            successful: [],
            failed: [],
            revalidationFailed: false,
        };
    }
}

export const baseMockFdrConfig: FdrConfig = {
    awsAccessKey: "",
    awsSecretKey: "",
    publicDocsS3: {
        bucketName: "fdr",
        bucketRegion: "us-east-1",
        urlOverride: "http://s3-mock:9090",
    },
    privateDocsS3: {
        bucketName: "fdr",
        bucketRegion: "us-east-1",
        urlOverride: "http://s3-mock:9090",
    },
    privateApiDefinitionSourceS3: {
        bucketName: "fdr",
        bucketRegion: "us-east-1",
        urlOverride: "http://s3-mock:9090",
    },
    venusUrl: "",
    domainSuffix: ".docs.buildwithfern.com",
    algoliaAppId: "",
    algoliaAdminApiKey: "",
    algoliaSearchIndex: "",
    algoliaSearchApiKey: "",
    algoliaSearchV2Domains: [],
    slackToken: "",
    logLevel: "debug",
    docsCacheEndpoint: process.env["DOCS_CACHE_ENDPOINT"] || "",
    enableCustomerNotifications: false,
    applicationEnvironment: "mock",
    redisEnabled: false,
    redisClusteringEnabled: false,
};

export function getMockFdrConfig(overrides?: Partial<FdrConfig>): FdrConfig {
    if (overrides) {
        return {
            ...baseMockFdrConfig,
            ...overrides,
        };
    }
    return baseMockFdrConfig;
}

export function createMockFdrApplication({
    orgIds,
    services,
    configOverrides,
}: {
    orgIds?: string[];
    services?: Partial<FdrServices>;
    configOverrides?: Partial<FdrConfig>;
}) {
    return new FdrApplication(getMockFdrConfig(configOverrides), {
        auth: new MockAuthService({
            orgIds: orgIds ?? [],
        }),
        algolia: new MockAlgoliaService(),
        slack: new MockSlackService(),
        revalidator: new MockRevalidatorService(),
        ...services,
    });
}
