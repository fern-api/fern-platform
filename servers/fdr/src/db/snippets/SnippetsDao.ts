import { Language, Prisma, PrismaClient, Sdk, Snippet } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

import { FdrAPI } from "@fern-api/fdr-sdk";

import { InternalError } from "../../api/generated/api/resources/commons/errors";
import { assertNever, readBuffer, writeBuffer } from "../../util";
import { SdkDaoImpl } from "../sdk/SdkDao";
import { PrismaTransaction, SdkId } from "../types";
import { EndpointSnippetCollector } from "./EndpointSnippetCollectors";
import { SdkIdFactory } from "./SdkIdFactory";
import {
  getPackageNameFromSdkSnippetsCreate,
  getSdkFromSdkRequest,
} from "./getPackageNameFromSdkSnippetsCreate";

export const DEFAULT_SNIPPETS_PAGE_SIZE = 100;

export interface LoadDbSnippetsPage {
  orgId: FdrAPI.OrgId;
  apiId: FdrAPI.ApiId;
  endpointIdentifier: FdrAPI.EndpointIdentifier | undefined;
  exampleIdentifier: string | undefined;
  sdks: FdrAPI.SdkRequest[] | undefined;
  page: number | undefined;
}

export interface DbSnippetsPage {
  snippets: Record<FdrAPI.EndpointPathLiteral, FdrAPI.SnippetsByEndpointMethod>;
  snippetsByEndpointId: Record<string, FdrAPI.Snippet[]>;
  nextPage: number | undefined;
}

export interface StoreSnippetsInfo {
  orgId: FdrAPI.OrgId;
  apiId: FdrAPI.ApiId;
  sdk: FdrAPI.SdkSnippetsCreate;
}

export interface StoreSnippetsResponse {
  sdkId: string;
}

export interface SdkInfo {
  id: string;
  language: Language;
}

export interface SnippetsDao {
  // TODO(armando): whenever we call this, we should call this other endpoint too
  loadAllSnippetsForSdkIds(
    sdkIds: string[]
  ): Promise<
    Record<
      string,
      Record<FdrAPI.EndpointPathLiteral, FdrAPI.SnippetsByEndpointMethod>
    >
  >;

  loadAllSnippetsForSdkIdsByEndpointId(
    sdkIds: string[]
  ): Promise<Record<string, Record<string, FdrAPI.Snippet[]>>>;

  // TODO(armando): same here
  loadAllSnippetsBySdkId(
    sdkId: string
  ): Promise<
    Record<FdrAPI.EndpointPathLiteral, FdrAPI.SnippetsByEndpointMethod>
  >;

  loadAllSnippetsBySdkIdByEndpointId(
    sdkId: string
  ): Promise<Record<string, FdrAPI.Snippet[]>>;

  loadSnippetsPage({
    loadSnippetsInfo,
  }: {
    loadSnippetsInfo: LoadDbSnippetsPage;
  }): Promise<DbSnippetsPage>;

  storeSnippets({
    storeSnippetsInfo,
  }: {
    storeSnippetsInfo: StoreSnippetsInfo;
  }): Promise<StoreSnippetsResponse>;
}

export class SnippetsDaoImpl implements SnippetsDao {
  constructor(private readonly prisma: PrismaClient) {}
  private async loadAllSnippetsToCollector(
    sdkId: string
  ): Promise<EndpointSnippetCollector> {
    const dbSdkRow = await this.prisma.sdk.findFirst({
      where: {
        id: {
          in: [sdkId],
        },
      },
    });
    if (dbSdkRow == null) {
      throw new InternalError(
        `Internal error; SDK identified by ${sdkId} was not found`
      );
    }
    const dbSnippetRows = await this.prisma.snippet.findMany({
      where: {
        sdkId,
      },
    });
    const snippetCollector = new EndpointSnippetCollector();
    for (const dbSnippetRow of dbSnippetRows) {
      const snippet = convertSnippetFromDb({
        dbSdkRow,
        dbSnippet: dbSnippetRow,
      });
      if (snippet != null) {
        snippetCollector.collect({
          endpointPath: FdrAPI.EndpointPathLiteral(dbSnippetRow.endpointPath),
          endpointMethod: dbSnippetRow.endpointMethod,
          identifierOverride: dbSnippetRow.identifierOverride ?? undefined,
          snippet,
        });
      }
    }

    return snippetCollector;
  }

  public async loadAllSnippetsBySdkIdByEndpointId(
    sdkId: string
  ): Promise<Record<string, FdrAPI.Snippet[]>> {
    const snippetCollector = await this.loadAllSnippetsToCollector(sdkId);
    return snippetCollector.getByIdentifierOverride();
  }

  public async loadAllSnippetsForSdkIdsByEndpointId(
    sdkIds: string[]
  ): Promise<Record<string, Record<string, FdrAPI.Snippet[]>>> {
    const result: Record<string, Record<string, FdrAPI.Snippet[]>> = {};
    for (const sdkId of sdkIds) {
      const snippets = await this.loadAllSnippetsBySdkIdByEndpointId(sdkId);
      result[sdkId] = snippets;
    }
    return result;
  }

  public async loadAllSnippetsForSdkIds(
    sdkIds: string[]
  ): Promise<Record<string, Record<SdkId, FdrAPI.SnippetsByEndpointMethod>>> {
    const result: Record<
      string,
      Record<SdkId, FdrAPI.SnippetsByEndpointMethod>
    > = {};
    for (const sdkId of sdkIds) {
      const snippets = await this.loadAllSnippetsBySdkId(sdkId);
      result[sdkId] = snippets;
    }
    return result;
  }

  public async loadAllSnippetsBySdkId(
    sdkId: string
  ): Promise<Record<string, FdrAPI.SnippetsByEndpointMethod>> {
    const snippetCollector = await this.loadAllSnippetsToCollector(sdkId);
    return snippetCollector.get();
  }

  public async loadSnippetsPage({
    loadSnippetsInfo,
  }: {
    loadSnippetsInfo: LoadDbSnippetsPage;
  }): Promise<DbSnippetsPage> {
    return await this.prisma.$transaction(async (tx) => {
      const sdkIds: string[] | undefined =
        loadSnippetsInfo.sdks != null
          ? await Promise.all(
              loadSnippetsInfo.sdks.map(async (sdk: FdrAPI.SdkRequest) => {
                return sdkInfoFromSdk({
                  sdk: await getSdkFromSdkRequest(this.prisma, sdk),
                }).id;
              })
            )
          : undefined;

      const sdkIdsForSnippets =
        sdkIds != null
          ? sdkIds
          : await this.getSdkIdsReferencedBySnippetRows({
              loadSnippetsInfo,
              tx,
            });
      const dbSdkRows = await tx.sdk.findMany({
        where: {
          id: {
            in: sdkIdsForSnippets,
          },
        },
      });
      const sdkIdToDbSdkRow = Object.fromEntries(
        dbSdkRows.map((dbSdkRow) => [dbSdkRow.id, dbSdkRow])
      );

      const loadSnippetsQuery: Prisma.SnippetFindManyArgs = {
        where: {
          orgId: loadSnippetsInfo.orgId,
          apiName: loadSnippetsInfo.apiId,
          sdkId: {
            in: sdkIds != null && sdkIds.length > 0 ? sdkIds : undefined,
          },
          endpointPath: loadSnippetsInfo.endpointIdentifier?.path,
          endpointMethod: loadSnippetsInfo.endpointIdentifier?.method,
          identifierOverride:
            loadSnippetsInfo.endpointIdentifier?.identifierOverride,
          exampleIdentifier: loadSnippetsInfo.exampleIdentifier,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: DEFAULT_SNIPPETS_PAGE_SIZE,
        skip:
          loadSnippetsInfo.page != null
            ? (loadSnippetsInfo.page - 1) * DEFAULT_SNIPPETS_PAGE_SIZE
            : undefined,
      };
      const snippetDbRows = await tx.snippet.findMany(loadSnippetsQuery);

      const snippetCollector = new EndpointSnippetCollector();
      for (const dbSnippetRow of snippetDbRows) {
        const dbSdkRow = sdkIdToDbSdkRow[dbSnippetRow.sdkId];
        if (dbSdkRow == null) {
          throw new InternalError(
            `Internal error; SDK identified by ${dbSnippetRow.sdkId} was not found`
          );
        }
        const snippet = convertSnippetFromDb({
          dbSdkRow,
          dbSnippet: dbSnippetRow,
        });
        if (snippet != null) {
          snippetCollector.collect({
            endpointPath: FdrAPI.EndpointPathLiteral(dbSnippetRow.endpointPath),
            endpointMethod: dbSnippetRow.endpointMethod,
            identifierOverride: dbSnippetRow.identifierOverride ?? undefined,
            snippet,
          });
        }
      }
      return {
        nextPage:
          snippetDbRows.length === DEFAULT_SNIPPETS_PAGE_SIZE
            ? (loadSnippetsInfo.page ?? 1) + 1
            : undefined,
        snippets: snippetCollector.get(),
        snippetsByEndpointId: snippetCollector.getByIdentifierOverride(),
      };
    });
  }

  public async getSdkIdsReferencedBySnippetRows({
    tx,
    loadSnippetsInfo,
  }: {
    tx: PrismaTransaction;
    loadSnippetsInfo: LoadDbSnippetsPage;
  }): Promise<string[]> {
    return (
      await tx.snippet.groupBy({
        by: ["sdkId"],
        where: {
          orgId: loadSnippetsInfo.orgId,
          apiName: loadSnippetsInfo.apiId,
          endpointPath: loadSnippetsInfo.endpointIdentifier?.path,
          endpointMethod: loadSnippetsInfo.endpointIdentifier?.method,
          identifierOverride:
            loadSnippetsInfo.endpointIdentifier?.identifierOverride,
          exampleIdentifier: loadSnippetsInfo.exampleIdentifier,
        },
      })
    ).map((row) => row.sdkId);
  }

  public async storeSnippets({
    storeSnippetsInfo,
  }: {
    storeSnippetsInfo: StoreSnippetsInfo;
  }): Promise<StoreSnippetsResponse> {
    const sdkDao = new SdkDaoImpl(this.prisma);

    return await this.prisma.$transaction(async (tx) => {
      const dbApi = await tx.snippetApi.findUnique({
        where: {
          orgId_apiName: {
            orgId: storeSnippetsInfo.orgId,
            apiName: storeSnippetsInfo.apiId,
          },
        },
      });
      if (dbApi === null) {
        await tx.snippetApi.create({
          data: {
            orgId: storeSnippetsInfo.orgId,
            apiName: storeSnippetsInfo.apiId,
          },
        });
      }
      const sdkInfo = sdkInfoFromSnippetsCreate({
        sdkSnippetsCreate: storeSnippetsInfo.sdk,
      });

      await sdkDao.createSdkIfNotExists(
        {
          id: sdkInfo.id,
          sdkPackage: getPackageNameFromSdkSnippetsCreate(
            storeSnippetsInfo.sdk
          ),
          version: storeSnippetsInfo.sdk.sdk.version,
          language: sdkInfo.language,
          sdk: writeBuffer(storeSnippetsInfo.sdk.sdk),
        },
        tx,
        true
      );

      const snippets: Prisma.Enumerable<Prisma.SnippetCreateManyInput> = [];
      storeSnippetsInfo.sdk.snippets.map((snippet) => {
        snippets.push({
          id: uuidv4(),
          orgId: storeSnippetsInfo.orgId,
          apiName: storeSnippetsInfo.apiId,
          endpointPath: snippet.endpoint.path,
          endpointMethod: snippet.endpoint.method,
          identifierOverride: snippet.endpoint.identifierOverride,
          exampleIdentifier: snippet.exampleIdentifier,
          sdkId: sdkInfo.id,
          snippet: writeBuffer(snippet.snippet),
        });
      });
      await tx.snippet.createMany({
        data: snippets,
      });
      return {
        sdkId: sdkInfo.id,
      };
    });
  }
}

function sdkInfoFromSnippetsCreate({
  sdkSnippetsCreate,
}: {
  sdkSnippetsCreate: FdrAPI.SdkSnippetsCreate;
}): SdkInfo {
  switch (sdkSnippetsCreate.type) {
    case "typescript":
      return {
        language: Language.TYPESCRIPT,
        id: SdkIdFactory.fromTypescript(sdkSnippetsCreate.sdk),
      };
    case "python":
      return {
        language: Language.PYTHON,
        id: SdkIdFactory.fromPython(sdkSnippetsCreate.sdk),
      };
    case "go":
      return {
        language: Language.GO,
        id: SdkIdFactory.fromGo(sdkSnippetsCreate.sdk),
      };
    case "ruby":
      return {
        language: Language.RUBY,
        id: SdkIdFactory.fromRuby(sdkSnippetsCreate.sdk),
      };
    case "java":
      return {
        language: Language.JAVA,
        id: SdkIdFactory.fromJava(sdkSnippetsCreate.sdk),
      };
    case "csharp":
      return {
        language: Language.CSHARP,
        id: SdkIdFactory.fromCSharp(sdkSnippetsCreate.sdk),
      };
  }
}

function sdkInfoFromSdk({ sdk }: { sdk: FdrAPI.Sdk }): SdkInfo {
  switch (sdk.type) {
    case "typescript":
      return {
        language: Language.TYPESCRIPT,
        id: SdkIdFactory.fromTypescript(sdk),
      };
    case "python":
      return {
        language: Language.PYTHON,
        id: SdkIdFactory.fromPython(sdk),
      };
    case "go":
      return {
        language: Language.GO,
        id: SdkIdFactory.fromGo(sdk),
      };
    case "ruby":
      return {
        language: Language.RUBY,
        id: SdkIdFactory.fromRuby(sdk),
      };
    case "java":
      return {
        language: Language.JAVA,
        id: SdkIdFactory.fromJava(sdk),
      };
    case "csharp":
      return {
        language: Language.CSHARP,
        id: SdkIdFactory.fromCSharp(sdk),
      };
  }
}

function convertSnippetFromDb({
  dbSdkRow,
  dbSnippet,
}: {
  dbSdkRow: Sdk;
  dbSnippet: Snippet;
}): FdrAPI.Snippet | undefined {
  const sdk = readBuffer(dbSdkRow.sdk) as FdrAPI.Sdk;
  switch (dbSdkRow.language) {
    case Language.TYPESCRIPT:
      return {
        type: "typescript",
        sdk: sdk as FdrAPI.TypeScriptSdk,
        client: (readBuffer(dbSnippet.snippet) as FdrAPI.TypeScriptSnippetCode)
          .client,
        exampleIdentifier: dbSnippet.exampleIdentifier ?? undefined,
      };
    case Language.PYTHON: {
      const pythonSnippetCode: FdrAPI.PythonSnippetCode = readBuffer(
        dbSnippet.snippet
      ) as FdrAPI.PythonSnippetCode;
      return {
        type: "python",
        sdk: sdk as FdrAPI.PythonSdk,
        async_client: pythonSnippetCode.async_client,
        sync_client: pythonSnippetCode.sync_client,
        exampleIdentifier: dbSnippet.exampleIdentifier ?? undefined,
      };
    }
    case Language.GO:
      return {
        type: "go",
        sdk: sdk as FdrAPI.GoSdk,
        client: (readBuffer(dbSnippet.snippet) as FdrAPI.GoSnippetCode).client,
        exampleIdentifier: dbSnippet.exampleIdentifier ?? undefined,
      };
    case Language.RUBY:
      return {
        type: "ruby",
        sdk: sdk as FdrAPI.RubySdk,
        client: (readBuffer(dbSnippet.snippet) as FdrAPI.RubySnippetCode)
          .client,
        exampleIdentifier: dbSnippet.exampleIdentifier ?? undefined,
      };
    case Language.JAVA: {
      const javaSnippetCode: FdrAPI.JavaSnippetCode = readBuffer(
        dbSnippet.snippet
      ) as FdrAPI.JavaSnippetCode;
      return {
        type: "java",
        sdk: sdk as FdrAPI.JavaSdk,
        async_client: javaSnippetCode.async_client,
        sync_client: javaSnippetCode.sync_client,
        exampleIdentifier: dbSnippet.exampleIdentifier ?? undefined,
      };
    }
    case Language.CSHARP:
    case Language.PHP:
    case Language.SWIFT:
    case Language.RUST:
      return undefined;
    default:
      assertNever(dbSdkRow.language);
  }
}
