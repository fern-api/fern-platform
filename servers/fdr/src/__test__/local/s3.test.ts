import { readFile } from "fs/promises";
import { S3ServiceImpl } from "../../services/s3";

describe("S3 Service", () => {
    it.skip("Test S3 Upload URLs", async () => {
        const s3Service = new S3ServiceImpl({
            venusUrl: "string",
            awsAccessKey: process.env.AWS_ACCESS_KEY_ID ?? "",
            awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
            publicS3: {
                bucketName: "fdr-dev2-docs-files-public",
                bucketRegion: "us-east-1",
                urlOverride: undefined,
            },
            privateS3: {
                bucketName: "fdr-dev2-docs-files",
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
        const response = await s3Service.createPresignedUploadUrlWithClient({
            domain: "buildwithfern.com",
            time: "12340",
            isPrivate: false,
            filepath: "deep",
        });
        console.log(response.url);
        expect(true).toEqual(true);
        const response2 = await fetch(response.url, {
            method: "PUT",
            body: await readFile("<path-to-files>"),
        });
        expect(response2.status).toEqual(200);
    });
});
