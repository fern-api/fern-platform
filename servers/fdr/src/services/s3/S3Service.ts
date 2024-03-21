import { GetObjectCommand, PutObjectCommand, PutObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import NodeCache from "node-cache";
import { v4 as uuidv4 } from "uuid";
import { DocsV1Write, DocsV2Write } from "../../api";
import type { FdrApplication } from "../../app";

export interface S3FileInfo {
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

export interface S3Service {
    getPresignedUploadUrls({
        domain,
        filepaths,
        images,
    }: {
        domain: string;
        filepaths: DocsV1Write.FilePath[];
        images: DocsV2Write.ImageFilePath[];
    }): Promise<Record<DocsV1Write.FilePath, S3FileInfo>>;

    getPresignedDownloadUrl({ key }: { key: string }): Promise<string>;
}

export class S3ServiceImpl implements S3Service {
    private client: S3Client;
    private presignedDownloadUrlCache: NodeCache = new NodeCache({
        stdTTL: 3600,
        maxKeys: 1_000,
    });

    constructor(private readonly app: FdrApplication) {
        const { config } = app;
        this.client = new S3Client({
            ...(config.s3UrlOverride != null ? { endpoint: config.s3UrlOverride } : {}),
            region: config.s3BucketRegion,
            credentials: {
                accessKeyId: config.awsAccessKey,
                secretAccessKey: config.awsSecretKey,
            },
        });
    }

    async getPresignedDownloadUrl({ key }: { key: string }): Promise<string> {
        const cachedUrl = await this.presignedDownloadUrlCache.get(key);
        if (cachedUrl != null && typeof cachedUrl === "string") {
            return cachedUrl;
        }
        const command = new GetObjectCommand({
            Bucket: this.app.config.s3BucketName,
            Key: key,
        });
        const signedUrl = getSignedUrl(this.client, command, { expiresIn: 604800 });
        this.presignedDownloadUrlCache.set(key, signedUrl);
        return signedUrl;
    }

    async getPresignedUploadUrls({
        domain,
        filepaths,
        images,
    }: {
        domain: string;
        filepaths: DocsV1Write.FilePath[];
        images: DocsV2Write.ImageFilePath[];
    }): Promise<Record<DocsV1Write.FilePath, S3FileInfo>> {
        const result: Record<DocsV1Write.FilePath, S3FileInfo> = {};
        const time: string = new Date().toISOString();
        for (const filepath of filepaths) {
            const { url, key } = await this.createPresignedUploadUrlWithClient({ domain, time, filepath });
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
            const { url, key } = await this.createPresignedUploadUrlWithClient({
                domain,
                time,
                filepath: image.filePath,
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

    async createPresignedUploadUrlWithClient({
        domain,
        time,
        filepath,
    }: {
        domain: string;
        time: string;
        filepath: DocsV1Write.FilePath;
    }): Promise<{ url: string; key: string }> {
        const key = this.constructS3Key({ domain, time, filepath });
        const input: PutObjectCommandInput = {
            Bucket: this.app.config.s3BucketName,
            Key: key,
        };
        if (filepath.endsWith(".svg")) {
            input.ContentType = "image/svg+xml";
        }
        const command = new PutObjectCommand(input);
        return {
            url: await getSignedUrl(this.client, command, { expiresIn: 3600 }),
            key,
        };
    }

    constructS3Key({
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
}
