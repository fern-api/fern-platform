import { DocsV1Write, FdrAPI } from "@fern-api/fdr-sdk";
import { AuthType, PrismaClient } from "@prisma/client";
import { S3DocsFileInfo } from "../../services/s3";
import { readBuffer, writeBuffer } from "../../util";
import { ParsedBaseUrl } from "../../util/ParsedBaseUrl";

export interface DocsRegistrationInfo {
  fernUrl: ParsedBaseUrl;
  customUrls: ParsedBaseUrl[];
  orgId: FdrAPI.OrgId;
  s3FileInfos: Record<DocsV1Write.FilePath, S3DocsFileInfo>;
  isPreview: boolean;
  authType: AuthType;
}

export class DocsRegistrationDao {
  constructor(private readonly prisma: PrismaClient) {}

  public async storeDocsRegistrationById(
    id: DocsV1Write.DocsRegistrationId,
    info: DocsRegistrationInfo
  ): Promise<void> {
    await this.prisma.docsRegistrations.create({
      data: {
        fernURL: info.fernUrl.getFullUrl(),
        registrationID: id,
        authType: info.authType,
        customURLs: info.customUrls.map((parsedURL) => parsedURL.getFullUrl()),
        isPreview: info.isPreview,
        orgID: info.orgId,
        s3FileInfos: writeBuffer(info.s3FileInfos),
      },
    });
  }

  public async getDocsRegistrationById(
    id: DocsV1Write.DocsRegistrationId
  ): Promise<DocsRegistrationInfo> {
    const response = await this.prisma.docsRegistrations.findFirstOrThrow({
      where: {
        registrationID: id,
      },
    });
    return {
      authType: response.authType,
      customUrls: response.customURLs.map((url) => ParsedBaseUrl.parse(url)),
      isPreview: response.isPreview,
      orgId: FdrAPI.OrgId(response.orgID),
      fernUrl: ParsedBaseUrl.parse(response.fernURL),
      s3FileInfos: readBuffer(response.s3FileInfos) as any as Record<
        DocsV1Write.FilePath,
        S3DocsFileInfo
      >,
    };
  }
}
