import { GetObjectCommand, PutObjectCommand, PutObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
    Source,
    SourceId,
} from "@fern-api/fdr-sdk/src/client/generated/api/resources/api/resources/v1/resources/register";
import { v4 as uuidv4 } from "uuid";
import { Cache } from "../../Cache";
import { DocsV1Write, DocsV2Write } from "../../api";
import { FernRegistry } from "../../api/generated";
import type { FdrConfig } from "../../app";

const ONE_WEEK_IN_SECONDS = 604800;

export interface S3DocsFileInfo {
    presignedUrl: DocsV1Write.FileS3UploadUrl;
    key: string;
    imageMetadata:
        | {
              width: number;
              height: number;
              blurDataUrl: string | undefined;
              alt: string | undefined;
          }
        | undefined;
}

export interface S3SourceFileInfo {
    presignedUrl: string;
    key: string;
}

export interface S3Service {
    getPresignedDocsUploadUrls({
        domain,
        filepaths,
        images,
        isPrivate,
    }: {
        domain: string;
        filepaths: DocsV1Write.FilePath[];
        images: DocsV2Write.ImageFilePath[];
        isPrivate: boolean;
    }): Promise<Record<DocsV1Write.FilePath, S3DocsFileInfo>>;

    getPresignedDocsDownloadUrl({ key, isPrivate }: { key: string; isPrivate: boolean }): Promise<string>;

    getPresignedSourceUploadUrls({
        orgId,
        apiId,
        sources,
    }: {
        orgId: FernRegistry.OrgId;
        apiId: FernRegistry.ApiId;
        sources: Record<SourceId, Source>;
    }): Promise<Record<SourceId, S3SourceFileInfo>>;

    getPresignedSourceDownloadUrl({ key }: { key: string }): Promise<string>;
}

export class S3ServiceImpl implements S3Service {
    private publicDocsS3: S3Client;
    private privateDocsS3: S3Client;
    private privateSourceS3: S3Client;
    private presignedDownloadUrlCache = new Cache<string>(10_000, ONE_WEEK_IN_SECONDS);

    constructor(private readonly config: FdrConfig) {
        this.publicDocsS3 = new S3Client({
            ...(config.publicDocsS3.urlOverride != null ? { endpoint: config.publicDocsS3.urlOverride } : {}),
            region: config.publicDocsS3.bucketRegion,
            credentials: {
                accessKeyId: config.awsAccessKey,
                secretAccessKey: config.awsSecretKey,
            },
        });
        this.privateDocsS3 = new S3Client({
            ...(config.privateDocsS3.urlOverride != null ? { endpoint: config.privateDocsS3.urlOverride } : {}),
            region: config.privateDocsS3.bucketRegion,
            credentials: {
                accessKeyId: config.awsAccessKey,
                secretAccessKey: config.awsSecretKey,
            },
        });
        this.privateSourceS3 = new S3Client({
            ...(config.privateSourceS3.urlOverride != null ? { endpoint: config.privateSourceS3.urlOverride } : {}),
            region: config.privateSourceS3.bucketRegion,
            credentials: {
                accessKeyId: config.awsAccessKey,
                secretAccessKey: config.awsSecretKey,
            },
        });
    }

    async getPresignedDocsDownloadUrl({ key, isPrivate }: { key: string; isPrivate: boolean }): Promise<string> {
        if (isPrivate) {
            // presigned url for private
            const cachedUrl = this.presignedDownloadUrlCache.get(key);
            if (cachedUrl != null && typeof cachedUrl === "string") {
                return cachedUrl;
            }
            const command = new GetObjectCommand({
                Bucket: this.config.privateDocsS3.bucketName,
                Key: key,
            });
            const signedUrl = await getSignedUrl(this.privateDocsS3, command, { expiresIn: 604800 });
            this.presignedDownloadUrlCache.set(key, signedUrl);
            return signedUrl;
        }

        return `https://${this.config.publicDocsS3.bucketName}.s3.amazonaws.com/${key}`;
    }

    async getPresignedDocsUploadUrls({
        domain,
        filepaths,
        images,
        isPrivate,
    }: {
        domain: string;
        filepaths: DocsV1Write.FilePath[];
        images: DocsV2Write.ImageFilePath[];
        isPrivate: boolean;
    }): Promise<Record<DocsV1Write.FilePath, S3DocsFileInfo>> {
        const result: Record<DocsV1Write.FilePath, S3DocsFileInfo> = {};
        const time: string = new Date().toISOString();
        for (const filepath of filepaths) {
            const { url, key } = await this.createPresignedDocsUploadUrlWithClient({
                domain,
                time,
                filepath,
                isPrivate,
            });
            result[filepath] = {
                presignedUrl: {
                    fileId: uuidv4(),
                    uploadUrl: url,
                },
                key,
                imageMetadata: undefined,
            };
        }
        for (const image of images) {
            const { url, key } = await this.createPresignedDocsUploadUrlWithClient({
                domain,
                time,
                filepath: image.filePath,
                isPrivate,
            });
            result[image.filePath] = {
                presignedUrl: {
                    fileId: uuidv4(),
                    uploadUrl: url,
                },
                key,
                imageMetadata: {
                    width: image.width,
                    height: image.height,
                    blurDataUrl: image.blurDataUrl,
                    alt: image.alt,
                },
            };
        }
        return result;
    }

    async createPresignedDocsUploadUrlWithClient({
        domain,
        time,
        filepath,
        isPrivate,
    }: {
        domain: string;
        time: string;
        filepath: DocsV1Write.FilePath;
        isPrivate: boolean;
    }): Promise<{ url: string; key: string }> {
        const key = this.constructS3DocsKey({ domain, time, filepath });
        const bucketName = isPrivate ? this.config.privateDocsS3.bucketName : this.config.publicDocsS3.bucketName;
        const input: PutObjectCommandInput = {
            Bucket: bucketName,
            Key: key,
        };
        if (filepath.endsWith(".svg")) {
            input.ContentType = "image/svg+xml";
        }
        const command = new PutObjectCommand(input);
        return {
            url: await getSignedUrl(isPrivate ? this.privateDocsS3 : this.publicDocsS3, command, { expiresIn: 3600 }),
            key,
        };
    }

    async getPresignedSourceDownloadUrl({ key }: { key: string }): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.config.privateSourceS3.bucketName,
            Key: key,
        });
        return await getSignedUrl(this.privateDocsS3, command, { expiresIn: 604800 });
    }

    async getPresignedSourceUploadUrls({
        orgId,
        apiId,
        sources,
    }: {
        orgId: FernRegistry.OrgId;
        apiId: FernRegistry.ApiId;
        sources: Record<SourceId, Source>;
    }): Promise<Record<SourceId, S3SourceFileInfo>> {
        const result: Record<SourceId, S3SourceFileInfo> = {};
        const time: string = new Date().toISOString();
        for (const [sourceId, _source] of Object.entries(sources)) {
            const { url, key } = await this.createPresignedSourceUploadUrlWithClient({
                orgId,
                apiId,
                time,
                sourceId,
            });
            result[sourceId] = {
                presignedUrl: url,
                key,
            };
        }
        return result;
    }

    async createPresignedSourceUploadUrlWithClient({
        orgId,
        apiId,
        time,
        sourceId,
    }: {
        orgId: FernRegistry.OrgId;
        apiId: FernRegistry.ApiId;
        time: string;
        sourceId: string;
    }): Promise<{ url: string; key: string }> {
        const key = this.constructS3SourceKey({ orgId, apiId, time, sourceId });
        const bucketName = this.config.privateSourceS3.bucketName;
        const input: PutObjectCommandInput = {
            Bucket: bucketName,
            Key: key,
        };
        const command = new PutObjectCommand(input);
        return {
            url: await getSignedUrl(this.privateSourceS3, command, { expiresIn: 3600 }),
            key,
        };
    }

    constructS3DocsKey({
        domain,
        time,
        filepath,
    }: {
        domain: string;
        time: string;
        filepath: DocsV1Write.FilePath;
    }): string {
        return `${domain}/${time}/${filepath}`;
    }

    constructS3SourceKey({
        orgId,
        apiId,
        time,
        sourceId,
    }: {
        orgId: FernRegistry.OrgId;
        apiId: FernRegistry.ApiId;
        time: string;
        sourceId: SourceId;
    }): string {
        return `${orgId}/${apiId}/${time}/${sourceId}`;
    }
}
