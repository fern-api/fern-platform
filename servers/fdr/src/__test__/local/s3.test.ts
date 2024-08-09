import { readFile } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { S3ServiceImpl } from "../../services/s3";

describe("S3 Service", () => {
    it.skip("Test S3 Upload URLs", async () => {
        const s3Service = new S3ServiceImpl({
            venusUrl: "string",
            awsAccessKey: process.env.AWS_ACCESS_KEY_ID ?? "",
            awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
            publicDocsS3: {
                bucketName: "fdr-dev2-docs-files-public",
                bucketRegion: "us-east-1",
                urlOverride: undefined,
            },
            privateDocsS3: {
                bucketName: "fdr-dev2-docs-files",
                bucketRegion: "us-east-1",
                urlOverride: undefined,
            },
            privateSourceS3: {
                bucketName: "fdr-source-files",
                bucketRegion: "us-east-1",
                urlOverride: undefined,
            },
            domainSuffix: "string",
            algoliaAppId: "string",
            algoliaAdminApiKey: "string",
            algoliaSearchApiKey: "string",
            algoliaSearchIndex: "string",
            slackToken: "string",
            logLevel: "string",
            docsCacheEndpoint: "string",
            enableCustomerNotifications: true,
            redisEnabled: true,
            redisClusteringEnabled: true,
            applicationEnvironment: "string",
        });
        const startUploadDocsResponse = await s3Service.createPresignedDocsUploadUrlWithClient({
            domain: "buildwithfern.com",
            time: "12340",
            isPrivate: false,
            filepath: "deep",
        });
        console.log(startUploadDocsResponse.url);
        expect(true).toEqual(true);
        const uploadDocsResponse = await fetch(startUploadDocsResponse.url, {
            method: "PUT",
            body: await readFile("<path-to-files>"),
        });
        expect(uploadDocsResponse.status).toEqual(200);

        const startUploadSourceResponse = await s3Service.createPresignedSourceUploadUrlWithClient({
            orgId: "fern-api",
            apiId: "fern",
            time: "12340",
            sourceId: uuidv4(),
        });
        console.log(startUploadSourceResponse.url);
        expect(true).toEqual(true);
        const uploadSourceResponse = await fetch(startUploadSourceResponse.url, {
            method: "PUT",
            body: await readFile("<path-to-files>"),
        });
        expect(uploadSourceResponse.status).toEqual(200);
    });
});
