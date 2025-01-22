import {
  GetObjectCommand,
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  APIV1Write,
  DocsV1Write,
  DocsV2Write,
  FdrAPI,
} from "@fern-api/fdr-sdk";
import { v4 as uuidv4 } from "uuid";
import { Cache } from "../../Cache";
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

export interface S3ApiDefinitionSourceFileInfo {
  presignedUrl: string;
  key: string;
}

export interface S3Service {
  writeDBDocsDefinition(arg0: {
    domain: string;
    dbDocsDefinition: FdrAPI.docs.v1.db.DocsDefinitionDb.V3 & {
      config: FdrAPI.docs.v1.db.DocsDbConfig;
    };
  }): Promise<PutObjectCommandOutput>;
  getPresignedDocsAssetsUploadUrls({
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

  getPresignedDocsAssetsDownloadUrl({
    key,
    isPrivate,
  }: {
    key: string;
    isPrivate: boolean;
  }): Promise<FdrAPI.Url>;

  getPresignedApiDefinitionSourceUploadUrls({
    orgId,
    apiId,
    sources,
  }: {
    orgId: FernRegistry.OrgId;
    apiId: FernRegistry.ApiId;
    sources: Record<APIV1Write.SourceId, APIV1Write.Source>;
  }): Promise<Record<APIV1Write.SourceId, S3ApiDefinitionSourceFileInfo>>;

  getPresignedApiDefinitionSourceDownloadUrl({
    key,
  }: {
    key: string;
  }): Promise<string>;
}

export class S3ServiceImpl implements S3Service {
  private publicDocsCDNUrl: string;
  private publicDocsS3: S3Client;
  private privateDocsS3: S3Client;
  private privateApiDefinitionSourceS3: S3Client;
  private dbDocsDefinitionS3: S3Client;
  private presignedDownloadUrlCache = new Cache<string>(
    10_000,
    ONE_WEEK_IN_SECONDS
  );

  constructor(private readonly config: FdrConfig) {
    this.publicDocsCDNUrl = config.cdnPublicDocsUrl;
    this.publicDocsS3 = new S3Client({
      ...(config.publicDocsS3.urlOverride != null
        ? { endpoint: config.publicDocsS3.urlOverride }
        : {}),
      region: config.publicDocsS3.bucketRegion,
      credentials: {
        accessKeyId: config.awsAccessKey,
        secretAccessKey: config.awsSecretKey,
      },
    });
    this.privateDocsS3 = new S3Client({
      ...(config.privateDocsS3.urlOverride != null
        ? { endpoint: config.privateDocsS3.urlOverride }
        : {}),
      region: config.privateDocsS3.bucketRegion,
      credentials: {
        accessKeyId: config.awsAccessKey,
        secretAccessKey: config.awsSecretKey,
      },
    });
    this.dbDocsDefinitionS3 = new S3Client({
      ...(config.dbDocsDefinitionS3.urlOverride != null
        ? { endpoint: config.dbDocsDefinitionS3.urlOverride }
        : {}),
      region: config.dbDocsDefinitionS3.bucketRegion,
      credentials: {
        accessKeyId: config.awsAccessKey,
        secretAccessKey: config.awsSecretKey,
      },
    });
    this.privateApiDefinitionSourceS3 = new S3Client({
      ...(config.privateApiDefinitionSourceS3.urlOverride != null
        ? { endpoint: config.privateApiDefinitionSourceS3.urlOverride }
        : {}),
      region: config.privateApiDefinitionSourceS3.bucketRegion,
      credentials: {
        accessKeyId: config.awsAccessKey,
        secretAccessKey: config.awsSecretKey,
      },
    });
  }

  async getPresignedDocsAssetsDownloadUrl({
    key,
    isPrivate,
  }: {
    key: string;
    isPrivate: boolean;
  }): Promise<FdrAPI.Url> {
    if (isPrivate) {
      // presigned url for private
      const cachedUrl = this.presignedDownloadUrlCache.get(key);
      if (cachedUrl != null && typeof cachedUrl === "string") {
        return FdrAPI.Url(cachedUrl);
      }
      const command = new GetObjectCommand({
        Bucket: this.config.privateDocsS3.bucketName,
        Key: key,
      });
      const signedUrl = await getSignedUrl(this.privateDocsS3, command, {
        expiresIn: 604800,
      });
      this.presignedDownloadUrlCache.set(key, signedUrl);
      return FdrAPI.Url(signedUrl);
    }

    return FdrAPI.Url(`${this.publicDocsCDNUrl}/${key}`);
  }

  async getPresignedDocsAssetsUploadUrls({
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
      const { url, key } =
        await this.createPresignedDocsAssetsUploadUrlWithClient({
          domain,
          time,
          filepath,
          isPrivate,
        });
      result[filepath] = {
        presignedUrl: {
          fileId: APIV1Write.FileId(uuidv4()),
          uploadUrl: url,
        },
        key,
        imageMetadata: undefined,
      };
    }
    for (const image of images) {
      const { url, key } =
        await this.createPresignedDocsAssetsUploadUrlWithClient({
          domain,
          time,
          filepath: image.filePath,
          isPrivate,
        });
      result[image.filePath] = {
        presignedUrl: {
          fileId: APIV1Write.FileId(uuidv4()),
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

  async createPresignedDocsAssetsUploadUrlWithClient({
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
    const bucketName = isPrivate
      ? this.config.privateDocsS3.bucketName
      : this.config.publicDocsS3.bucketName;
    const input: PutObjectCommandInput = {
      Bucket: bucketName,
      Key: key,
    };
    if (filepath.endsWith(".svg")) {
      input.ContentType = "image/svg+xml";
    }
    const command = new PutObjectCommand(input);
    const result = {
      url: await getSignedUrl(
        isPrivate ? this.privateDocsS3 : this.publicDocsS3,
        command,
        { expiresIn: 3600 }
      ),
      key,
    };
    if (!isPrivate) {
      try {
        const url = new URL(result.url);
        result.url = result.url.replace(url.host, this.publicDocsCDNUrl);
      } catch (error) {
        console.error("Failed to replace S3 URL with CDN URL:", error);
      }
    }
    return result;
  }

  async getPresignedApiDefinitionSourceDownloadUrl({
    key,
  }: {
    key: string;
  }): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.config.privateApiDefinitionSourceS3.bucketName,
      Key: key,
    });
    return await getSignedUrl(this.privateDocsS3, command, {
      expiresIn: 604800,
    });
  }

  async getPresignedApiDefinitionSourceUploadUrls({
    orgId,
    apiId,
    sources,
  }: {
    orgId: FernRegistry.OrgId;
    apiId: FernRegistry.ApiId;
    sources: Record<APIV1Write.SourceId, APIV1Write.Source>;
  }): Promise<Record<APIV1Write.SourceId, S3ApiDefinitionSourceFileInfo>> {
    const result: Record<APIV1Write.SourceId, S3ApiDefinitionSourceFileInfo> =
      {};
    const time: string = new Date().toISOString();
    for (const [sourceId, _source] of Object.entries(sources)) {
      const { url, key } =
        await this.createPresignedApiDefinitionSourceUploadUrlWithClient({
          orgId,
          apiId,
          time,
          sourceId: APIV1Write.SourceId(sourceId),
        });
      result[APIV1Write.SourceId(sourceId)] = {
        presignedUrl: url,
        key,
      };
    }
    return result;
  }

  async createPresignedApiDefinitionSourceUploadUrlWithClient({
    orgId,
    apiId,
    time,
    sourceId,
  }: {
    orgId: FernRegistry.OrgId;
    apiId: FernRegistry.ApiId;
    time: string;
    sourceId: APIV1Write.SourceId;
  }): Promise<{ url: string; key: string }> {
    const key = this.constructS3ApiDefinitionSourceKey({
      orgId,
      apiId,
      time,
      sourceId,
    });
    const bucketName = this.config.privateApiDefinitionSourceS3.bucketName;
    const input: PutObjectCommandInput = {
      Bucket: bucketName,
      Key: key,
    };
    const command = new PutObjectCommand(input);
    return {
      url: await getSignedUrl(this.privateApiDefinitionSourceS3, command, {
        expiresIn: 3600,
      }),
      key,
    };
  }

  async writeDBDocsDefinition({
    domain,
    dbDocsDefinition,
  }: {
    domain: string;
    dbDocsDefinition: any;
  }): Promise<PutObjectCommandOutput> {
    const command = new PutObjectCommand({
      Bucket: this.config.dbDocsDefinitionS3.bucketName,
      Key: `${domain}.json`,
      Body: JSON.stringify(dbDocsDefinition),
    });
    return await this.dbDocsDefinitionS3.send(command);
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

  constructS3ApiDefinitionSourceKey({
    orgId,
    apiId,
    time,
    sourceId,
  }: {
    orgId: FernRegistry.OrgId;
    apiId: FernRegistry.ApiId;
    time: string;
    sourceId: APIV1Write.SourceId;
  }): string {
    return `${orgId}/${apiId}/${time}/${sourceId}`;
  }
}
