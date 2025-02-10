import { FdrAPI } from "@fern-api/fdr-sdk";
import { Language, PrismaClient } from "@prisma/client";

import { BadRequestError, Sdk, SdkRequest } from "../../api/generated/api";
import { assertNever } from "../../util";

export function getPackageNameFromSdkSnippetsCreate(
  create: FdrAPI.SdkSnippetsCreate
): string {
  switch (create.type) {
    case "go":
      return create.sdk.githubRepo;
    case "java":
      return `${create.sdk.group}:${create.sdk.artifact}`;
    case "python":
      return create.sdk.package;
    case "typescript":
      return create.sdk.package;
    case "ruby":
      return create.sdk.gem;
    default:
      assertNever(create);
  }
}

export function getPackageNameFromSdkRequest(sdk: FdrAPI.SdkRequest): string {
  switch (sdk.type) {
    case "go":
      return sdk.githubRepo;
    case "java":
      return `${sdk.group}:${sdk.artifact}`;
    case "python":
      return sdk.package;
    case "typescript":
      return sdk.package;
    case "ruby":
      return sdk.gem;
    default:
      assertNever(sdk);
  }
}

export async function getSdkFromSdkRequest(
  prismaClient: PrismaClient,
  request: SdkRequest
): Promise<Sdk> {
  if (request.version != null) {
    return { ...request, version: request.version };
  } else {
    const packageName = getPackageNameFromSdkRequest(request);
    const language = getLanguageFromRequest({ sdk: request });
    const sdkDao = await prismaClient.sdk.findFirst({
      select: {
        version: true,
      },
      where: {
        package: packageName,
        language,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (sdkDao == null) {
      throw new BadRequestError(
        `No SDK found for the given request: ${language} ${packageName}`
      );
    } else if (sdkDao.version == null) {
      throw new BadRequestError(
        "No version for SDK found for the given request"
      );
    }

    return {
      ...request,
      version: sdkDao.version,
    };
  }
}

export function getLanguageFromRequest({ sdk }: { sdk: SdkRequest }): Language {
  switch (sdk.type) {
    case "typescript":
      return Language.TYPESCRIPT;
    case "python":
      return Language.PYTHON;
    case "go":
      return Language.GO;
    case "ruby":
      return Language.RUBY;
    case "java":
      return Language.JAVA;
  }
}
