import {
  APIV1Db,
  convertDbAPIDefinitionToRead,
  convertDocsDefinitionToDb,
  convertDocsDefinitionToRead,
  DocsV1Db,
  DocsV1Write,
  FdrAPI,
  FernNavigation,
} from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { generateAlgoliaRecords } from "@fern-docs/search-server/archive";
import { AuthType } from "@prisma/client";
import { mapValues } from "es-toolkit/object";
import urlJoin from "url-join";
import { v4 as uuidv4 } from "uuid";
import { DocsV2WriteService } from "../../../api";
import { FernRegistry } from "../../../api/generated";
import { OrgId } from "../../../api/generated/api";
import {
  DomainBelongsToAnotherOrgError,
  InvalidUrlError,
} from "../../../api/generated/api/resources/commons/errors";
import { DocsRegistrationIdNotFound } from "../../../api/generated/api/resources/docs/resources/v1/resources/write/errors";
import { LoadDocsForUrlResponse } from "../../../api/generated/api/resources/docs/resources/v2/resources/read";
import {
  DocsNotFoundError,
  InvalidDomainError,
  ReindexNotAllowedError,
} from "../../../api/generated/api/resources/docs/resources/v2/resources/write/errors";
import { type FdrApplication } from "../../../app";
import { AlgoliaSearchRecord, IndexSegment } from "../../../services/algolia";
import { type S3DocsFileInfo } from "../../../services/s3";
import { WithoutQuestionMarks } from "../../../util";
import { ParsedBaseUrl } from "../../../util/ParsedBaseUrl";
import { getSearchInfoFromDocs } from "../v1/getDocsReadService";

export interface DocsRegistrationInfo {
  fernUrl: ParsedBaseUrl;
  customUrls: ParsedBaseUrl[];
  orgId: FdrAPI.OrgId;
  s3FileInfos: Record<DocsV1Write.FilePath, S3DocsFileInfo>;
  isPreview: boolean;
  authType: AuthType;
}

function pathnameIsMalformed(pathname: string): boolean {
  if (pathname === "" || pathname === "/") {
    return false;
  }
  if (!/^.*([a-z0-9]).*$/.test(pathname)) {
    // does the pathname only contain special characters?
    return true;
  }
  return false;
}

function validateAndParseFernDomainUrl({
  app,
  url,
}: {
  app: FdrApplication;
  url: string;
}): ParsedBaseUrl {
  const baseUrl = ParsedBaseUrl.parse(url);
  if (baseUrl.path != null && pathnameIsMalformed(baseUrl.path)) {
    throw new InvalidUrlError(
      `Domain URL is malformed: https://${baseUrl.hostname + baseUrl.path}`
    );
  }
  if (!baseUrl.hostname.endsWith(app.config.domainSuffix)) {
    throw new InvalidDomainError();
  }
  return baseUrl;
}

function parseCustomDomainUrls({
  customUrls,
}: {
  customUrls: string[];
}): ParsedBaseUrl[] {
  const parsedUrls: ParsedBaseUrl[] = [];
  for (const customUrl of customUrls) {
    const baseUrl = ParsedBaseUrl.parse(customUrl);
    parsedUrls.push(baseUrl);
  }
  return parsedUrls;
}

export function getDocsWriteV2Service(app: FdrApplication): DocsV2WriteService {
  return new DocsV2WriteService({
    startDocsRegister: async (req, res) => {
      await app.services.auth.checkUserBelongsToOrg({
        authHeader: req.headers.authorization,
        orgId: req.body.orgId,
      });

      const fernUrl = validateAndParseFernDomainUrl({
        app,
        url: req.body.domain,
      });
      const customUrls = parseCustomDomainUrls({
        customUrls: req.body.customDomains,
      });

      // ensure that the domains are not already registered by another org
      const { allDomainsOwned: hasOwnership, unownedDomains } = await app.dao
        .docsV2()
        .checkDomainsDontBelongToAnotherOrg(
          [fernUrl, ...customUrls].map((url) => url.getFullUrl()),
          req.body.orgId
        );
      if (!hasOwnership) {
        throw new DomainBelongsToAnotherOrgError(
          `The following domains belong to another organization: ${unownedDomains.join(", ")}`
        );
      }

      const docsRegistrationId = DocsV1Write.DocsRegistrationId(uuidv4());
      const s3FileInfos =
        await app.services.s3.getPresignedDocsAssetsUploadUrls({
          domain: req.body.domain,
          filepaths: req.body.filepaths,
          images: req.body.images ?? [],
          isPrivate: req.body.authConfig?.type === "private",
        });

      await app.services.slack.notifyGeneratedDocs({
        orgId: req.body.orgId,
        urls: [
          fernUrl.toURL().toString(),
          ...customUrls.map((url) => url.toURL().toString()),
        ],
      });
      await app.dao
        .docsRegistration()
        .storeDocsRegistrationById(docsRegistrationId, {
          fernUrl,
          customUrls,
          orgId: req.body.orgId,
          s3FileInfos,
          isPreview: false,
          authType:
            req.body.authConfig?.type === "private"
              ? AuthType.WORKOS_SSO
              : AuthType.PUBLIC,
        });
      return res.send({
        docsRegistrationId,
        uploadUrls: Object.fromEntries(
          Object.entries(s3FileInfos).map(([filepath, fileInfo]) => {
            return [filepath, fileInfo.presignedUrl];
          })
        ),
      });
    },
    startDocsPreviewRegister: async (req, res) => {
      await app.services.auth.checkUserBelongsToOrg({
        authHeader: req.headers.authorization,
        orgId: req.body.orgId,
      });
      const docsRegistrationId = DocsV1Write.DocsRegistrationId(uuidv4());
      const fernUrl = ParsedBaseUrl.parse(
        urlJoin(
          `${req.body.orgId}-preview-${docsRegistrationId}.${app.config.domainSuffix}`,
          req.body.basePath ?? ""
        )
      );
      const s3FileInfos =
        await app.services.s3.getPresignedDocsAssetsUploadUrls({
          domain: fernUrl.hostname,
          filepaths: req.body.filepaths,
          images: req.body.images ?? [],
          isPrivate: req.body.authConfig?.type === "private",
        });
      await app.dao
        .docsRegistration()
        .storeDocsRegistrationById(docsRegistrationId, {
          fernUrl,
          customUrls: [],
          orgId: req.body.orgId,
          s3FileInfos,
          isPreview: true,
          authType:
            req.body.authConfig?.type === "private"
              ? AuthType.WORKOS_SSO
              : AuthType.PUBLIC,
        });
      return res.send({
        docsRegistrationId,
        uploadUrls: Object.fromEntries(
          Object.entries(s3FileInfos).map(([filepath, fileInfo]) => {
            return [filepath, fileInfo.presignedUrl];
          })
        ),
        previewUrl: `https://${fernUrl.getFullUrl()}`,
      });
    },
    finishDocsRegister: async (req, res) => {
      const docsRegistrationInfo = await app.dao
        .docsRegistration()
        .getDocsRegistrationById(req.params.docsRegistrationId);
      if (docsRegistrationInfo == null) {
        throw new DocsRegistrationIdNotFound();
      }
      try {
        app.logger.debug(
          `[${docsRegistrationInfo.fernUrl.getFullUrl()}] Called finishDocsRegister`
        );
        await app.services.auth.checkUserBelongsToOrg({
          authHeader: req.headers.authorization,
          orgId: docsRegistrationInfo.orgId,
        });

        app.logger.debug(
          `[${docsRegistrationInfo.fernUrl.getFullUrl()}] Transforming Docs Definition to DB`
        );
        const dbDocsDefinition = convertDocsDefinitionToDb({
          writeShape: req.body.docsDefinition,
          files: docsRegistrationInfo.s3FileInfos,
        });

        const apiDefinitions = (
          await Promise.all(
            dbDocsDefinition.referencedApis.map(
              async (id) => await app.services.db.getApiDefinition(id)
            )
          )
        ).filter(isNonNullish);
        const apiDefinitionsLatest = (
          await Promise.all(
            dbDocsDefinition.referencedApis.map(
              async (id) => await app.services.db.getApiLatestDefinition(id)
            )
          )
        ).filter(isNonNullish);

        const apiDefinitionsById = Object.fromEntries(
          apiDefinitions.map((definition) => [definition.id, definition])
        );
        const apiDefinitionsLatestById = Object.fromEntries(
          apiDefinitionsLatest.map((definition) => [definition.id, definition])
        );

        const warmEndpointCachePromises = apiDefinitions.flatMap(
          (apiDefinition) => {
            return Object.entries(apiDefinition.subpackages).flatMap(
              ([id, subpackage]) => {
                return subpackage.endpoints.map(async (endpoint) => {
                  try {
                    return await fetch(
                      `https://${docsRegistrationInfo.fernUrl.getFullUrl()}/api/fern-docs/api-definition/${apiDefinition.id}/endpoint/${endpoint.originalEndpointId}`
                    );
                  } catch (e: Error | unknown) {
                    app.logger.error(
                      `Error while trying to warm endpoint cache for ${JSON.stringify(docsRegistrationInfo.fernUrl)} ${e instanceof Error ? e.stack : ""}`
                    );
                    throw e;
                  }
                });
              }
            );
          }
        );

        const indexSegments = await uploadToAlgoliaForRegistration(
          app,
          docsRegistrationInfo,
          dbDocsDefinition,
          apiDefinitionsById,
          apiDefinitionsLatestById
        );

        await app.docsDefinitionCache.storeDocsForUrl({
          docsRegistrationInfo,
          dbDocsDefinition,
          indexSegments,
        });

        const readDocsDefinition = convertDocsDefinitionToRead({
          docsDbDefinition: dbDocsDefinition,
          algoliaSearchIndex: undefined,
          filesV2: {},
          apis: mapValues(apiDefinitionsById, (def) =>
            convertDbAPIDefinitionToRead(def)
          ),
          apisV2: mapValues(apiDefinitionsLatestById, (def) => def),
          id: DocsV1Write.DocsConfigId(""),
          search: getSearchInfoFromDocs({
            algoliaIndex: undefined,
            indexSegmentIds: [],
            activeIndexSegments: [],
            docsDbDefinition: dbDocsDefinition,
            app,
          }),
        });

        try {
          await app.services.s3.writeDBDocsDefinition({
            domain: docsRegistrationInfo.fernUrl.getFullUrl(),
            readDocsDefinition,
          });
        } catch (e) {
          app.logger.error(
            `Error while trying to write DB docs definition for ${docsRegistrationInfo.fernUrl}`,
            e
          );
        }

        /**
         * IMPORTANT NOTE:
         * vercel cache is not shared between custom domains, so we need to revalidate on EACH custom domain individually
         */
        const urls = [
          docsRegistrationInfo.fernUrl,
          ...docsRegistrationInfo.customUrls,
        ];

        try {
          await Promise.all(
            urls.map(async (baseUrl) => {
              const results = await app.services.revalidator.revalidate({
                baseUrl,
                app,
              });
              if (results.failed.length === 0 && !results.revalidationFailed) {
                app.logger.info(
                  `Successfully revalidated ${results.successful.length} paths.`
                );
              } else {
                await app.services.slack.notifyFailedToRevalidatePaths({
                  domain: baseUrl.getFullUrl(),
                  paths: results,
                });
              }
            })
          );
        } catch (e) {
          app.logger.error(
            `Error while trying to revalidate docs for ${docsRegistrationInfo.fernUrl}`,
            e
          );
          await app.services.slack.notifyFailedToRegisterDocs({
            domain: docsRegistrationInfo.fernUrl.getFullUrl(),
            err: e,
          });
          throw e;
        }

        await Promise.all(warmEndpointCachePromises);

        return await res.send();
      } catch (e) {
        app.logger.error(
          `Error while trying to register docs for ${docsRegistrationInfo.fernUrl}`,
          e
        );
        await app.services.slack.notifyFailedToRegisterDocs({
          domain: docsRegistrationInfo.fernUrl.getFullUrl(),
          err: e,
        });
        throw e;
      }
    },
    reindexAlgoliaSearchRecords: async (req, res) => {
      // step 1. load from db
      const parsedUrl = ParsedBaseUrl.parse(req.body.url);
      const response = await app.dao.docsV2().loadDocsForURL(parsedUrl.toURL());

      if (response == null) {
        throw new DocsNotFoundError();
      }

      if (
        response.authType !== AuthType.PUBLIC ||
        response.isPreview ||
        response.docsConfigInstanceId == null
      ) {
        throw new ReindexNotAllowedError();
      }

      const apiDefinitions = (
        await Promise.all(
          response.docsDefinition.referencedApis.map(
            async (id) => await app.services.db.getApiDefinition(id)
          )
        )
      ).filter(isNonNullish);
      const apiDefinitionsById = Object.fromEntries(
        apiDefinitions.map((definition) => [definition.id, definition])
      );

      const apiDefinitionsLatest = (
        await Promise.all(
          response.docsDefinition.referencedApis.map(
            async (id) => await app.services.db.getApiLatestDefinition(id)
          )
        )
      ).filter(isNonNullish);
      const apiDefinitionsLatestById = Object.fromEntries(
        apiDefinitionsLatest.map((definition) => [definition.id, definition])
      );

      // step 2. create new index segments in algolia
      const indexSegments = await uploadToAlgolia(
        app,
        ParsedBaseUrl.parse(response.domain),
        response.docsDefinition,
        apiDefinitionsById,
        apiDefinitionsLatestById,
        response.algoliaIndex,
        response.docsConfigInstanceId
      );

      // step 3. store docs + new algolia segments
      await app.docsDefinitionCache.replaceDocsForInstanceId({
        instanceId: response.docsConfigInstanceId,
        dbDocsDefinition: response.docsDefinition,
        indexSegments,
      });

      return await res.send();
    },
    transferOwnershipOfDomain: async (req, res) => {
      // only fern users can transfer domain ownership
      await app.services.auth.checkUserBelongsToOrg({
        authHeader: req.headers.authorization,
        orgId: "fern",
      });

      const parsedUrl = ParsedBaseUrl.parse(req.body.domain);

      await app.dao.docsV2().transferDomainOwner({
        domain: parsedUrl.getFullUrl(),
        toOrgId: req.body.toOrgId,
      });

      return res.send();
    },
  });
}

async function uploadToAlgoliaForRegistration(
  app: FdrApplication,
  docsRegistrationInfo: DocsRegistrationInfo,
  dbDocsDefinition: WithoutQuestionMarks<DocsV1Db.DocsDefinitionDb.V3>,
  apiDefinitionsById: Record<string, APIV1Db.DbApiDefinition>,
  apiDefinitionsLatestById: Record<string, FdrAPI.api.latest.ApiDefinition>
): Promise<IndexSegment[]> {
  // TODO: make sure to store private docs index into user-restricted algolia index
  // see https://www.algolia.com/doc/guides/security/api-keys/how-to/user-restricted-access-to-data/
  if (docsRegistrationInfo.authType !== AuthType.PUBLIC) {
    return [];
  }

  // skip algolia step for preview
  if (docsRegistrationInfo.isPreview) {
    return [];
  }

  return uploadToAlgolia(
    app,
    docsRegistrationInfo.fernUrl,
    dbDocsDefinition,
    apiDefinitionsById,
    apiDefinitionsLatestById
  );
}

async function uploadToAlgolia(
  app: FdrApplication,
  url: ParsedBaseUrl,
  dbDocsDefinition: WithoutQuestionMarks<DocsV1Db.DocsDefinitionDb>,
  apiDefinitionsById: Record<string, APIV1Db.DbApiDefinition>,
  apiDefinitionsLatestById: Record<string, FdrAPI.api.latest.ApiDefinition>,
  algoliaIndex?: FernRegistry.AlgoliaSearchIndex,
  docsConfigInstanceId?: DocsV1Write.DocsConfigId
): Promise<IndexSegment[]> {
  app.logger.debug(`[${url.getFullUrl()}] Generating new index segments`);
  const generateNewIndexSegmentsResult =
    app.services.algoliaIndexSegmentManager.generateIndexSegmentsForDefinition({
      dbDocsDefinition,
      url: url.getFullUrl(),
    });
  const configSegmentTuples =
    generateNewIndexSegmentsResult.type === "versioned"
      ? generateNewIndexSegmentsResult.configSegmentTuples
      : [generateNewIndexSegmentsResult.configSegmentTuple];
  const newIndexSegments = configSegmentTuples.map(([, seg]) => seg);

  app.logger.debug(
    `[${url.getFullUrl()}] Generating search records for all versions`
  );

  let searchRecords: AlgoliaSearchRecord[] = [];
  if (dbDocsDefinition.config.root == null) {
    try {
      searchRecords = await app.services.algolia.generateSearchRecords({
        url: url.getFullUrl(),
        docsDefinition: dbDocsDefinition,
        apiDefinitionsById,
        configSegmentTuples,
      });
    } catch (e) {
      app.logger.error(
        `Error while trying to generate search records for ${url.getFullUrl()}`,
        e
      );
      await app.services.slack.notify(
        `Fatal error thrown while generating search records for ${url.getFullUrl()}. Search may not be available for this docs instance.`,
        e
      );
      throw e;
    }
  } else {
    const loadDocsForUrlResponse: LoadDocsForUrlResponse = {
      baseUrl: {
        domain: url.hostname,
        basePath: url.path?.trim(),
      },
      definition: convertDocsDefinitionToRead({
        docsDbDefinition: dbDocsDefinition,
        algoliaSearchIndex: algoliaIndex,
        // we don't need to use this for generating algolia records
        filesV2: {},
        apis: mapValues(apiDefinitionsById, (def) =>
          convertDbAPIDefinitionToRead(def)
        ),
        apisV2: mapValues(apiDefinitionsLatestById, (def) => def),
        id: docsConfigInstanceId ?? DocsV1Write.DocsConfigId(""),
        search: getSearchInfoFromDocs({
          algoliaIndex,
          indexSegmentIds: newIndexSegments.map(
            (indexSegment) => indexSegment.id
          ),
          activeIndexSegments: newIndexSegments.map((indexSegment) => ({
            id: indexSegment.id,
            createdAt: new Date(),
            version: null,
          })),
          docsDbDefinition: dbDocsDefinition,
          app,
        }),
      }),
      lightModeEnabled: dbDocsDefinition.config.colorsV3?.type !== "dark",
      orgId: OrgId("dummy"),
    };

    // TODO: consolidate this
    const apis =
      Object.entries(loadDocsForUrlResponse.definition.apis).length > 0
        ? FernNavigation.utils.toApis(loadDocsForUrlResponse)
        : loadDocsForUrlResponse.definition.apisV2;
    await Promise.all(
      configSegmentTuples.map(async ([_, indexSegment]) => {
        try {
          const v2Records = generateAlgoliaRecords({
            indexSegmentId: indexSegment.id,
            nodes: FernNavigation.utils.toRootNode(loadDocsForUrlResponse),
            pages: FernNavigation.utils.toPages(loadDocsForUrlResponse),
            apis,
            isFieldRecordsEnabled: true,
          });
          searchRecords.push(
            ...v2Records.map((record) => ({
              ...record,
              objectID: uuidv4(),
            }))
          );
        } catch (e) {
          app.logger.error(
            `Error while trying to generate search records for ${url.getFullUrl()}`,
            e
          );
          await app.services.slack.notify(
            `Fatal error thrown while generating search records for ${url.getFullUrl()}. Search may not be available for this docs instance.`,
            e
          );
          throw e;
        }
      })
    );
  }

  app.logger.debug(`[${url.getFullUrl()}] Uploading search records to Algolia`);
  await app.services.algolia.uploadSearchRecords(searchRecords);

  app.logger.debug(`[${url.getFullUrl()}] Updating db docs definitions`);

  return newIndexSegments;
}

/**
 * This is a temporary solution to generate a staging URL from a production URL. It will ignore custom domains and dev domains.
 * @param url production URL
 * @returns staging URL or undefined if the URL is not a production URL
 */
function createStagingUrl(url: ParsedBaseUrl): ParsedBaseUrl | undefined {
  const maybeProdUrl = url.getFullUrl();
  if (maybeProdUrl.includes(".docs.buildwithfern.com")) {
    return ParsedBaseUrl.parse(
      maybeProdUrl.replace(
        ".docs.buildwithfern.com",
        ".docs.staging.buildwithfern.com"
      )
    );
  }
  return undefined;
}
