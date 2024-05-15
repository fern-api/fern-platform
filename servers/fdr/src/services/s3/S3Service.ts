import { GetObjectCommand, PutObjectCommand, PutObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { Cache } from "../../Cache";
import { DocsV1Write, DocsV2Write } from "../../api";
import type { FdrApplication } from "../../app";

const ONE_WEEK_IN_SECONDS = 604800;

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
        isPrivate,
    }: {
        domain: string;
        filepaths: DocsV1Write.FilePath[];
        images: DocsV2Write.ImageFilePath[];
        isPrivate: boolean;
    }): Promise<Record<DocsV1Write.FilePath, S3FileInfo>>;

    getPresignedDownloadUrl({ key, isPrivate }: { key: string; isPrivate: boolean }): Promise<string>;
}

export class S3ServiceImpl implements S3Service {
    private publicS3: S3Client;
    private privateS3: S3Client;
    private presignedDownloadUrlCache = new Cache<string>(10_000, ONE_WEEK_IN_SECONDS);

    constructor(private readonly app: FdrApplication) {
        const { config } = app;
        this.publicS3 = new S3Client({
            ...(config.publicS3.urlOverride != null ? { endpoint: config.publicS3.urlOverride } : {}),
            region: config.publicS3.bucketRegion,
            credentials: {
                accessKeyId: config.awsAccessKey,
                secretAccessKey: config.awsSecretKey,
            },
        });
        this.privateS3 = new S3Client({
            ...(config.privateS3.urlOverride != null ? { endpoint: config.privateS3.urlOverride } : {}),
            region: config.privateS3.bucketRegion,
            credentials: {
                accessKeyId: config.awsAccessKey,
                secretAccessKey: config.awsSecretKey,
            },
        });
    }

    async getPresignedDownloadUrl({ key, isPrivate }: { key: string; isPrivate: boolean }): Promise<string> {
        if (isPrivate) {
            // presigned url for private
            const cachedUrl = this.presignedDownloadUrlCache.get(key);
            if (cachedUrl != null && typeof cachedUrl === "string") {
                return cachedUrl;
            }
            const command = new GetObjectCommand({
                Bucket: this.app.config.privateS3.bucketName,
                Key: key,
            });
            const signedUrl = await getSignedUrl(this.privateS3, command, { expiresIn: 604800 });
            this.presignedDownloadUrlCache.set(key, signedUrl);
            return signedUrl;
        }

        return `https://${this.app.config.publicS3.bucketName}.s3.amazonaws.com/${key}`;
    }

    async getPresignedUploadUrls({
        domain,
        filepaths,
        images,
        isPrivate,
    }: {
        domain: string;
        filepaths: DocsV1Write.FilePath[];
        images: DocsV2Write.ImageFilePath[];
        isPrivate: boolean;
    }): Promise<Record<DocsV1Write.FilePath, S3FileInfo>> {
        const result: Record<DocsV1Write.FilePath, S3FileInfo> = {};
        const time: string = new Date().toISOString();
        for (const filepath of filepaths) {
            const { url, key } = await this.createPresignedUploadUrlWithClient({ domain, time, filepath, isPrivate });
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

    async createPresignedUploadUrlWithClient({
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
        const key = this.constructS3Key({ domain, time, filepath });
        const input: PutObjectCommandInput = {
            Bucket: isPrivate ? this.app.config.privateS3.bucketName : this.app.config.publicS3.bucketName,
            Key: key,
        };
        if (filepath.endsWith(".svg")) {
            input.ContentType = "image/svg+xml";
        }
        const command = new PutObjectCommand(input);
        return {
            url: await getSignedUrl(isPrivate ? this.privateS3 : this.publicS3, command, { expiresIn: 3600 }),
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
