import {
  APIV1Db,
  APIV1Write,
  convertAPIDefinitionToDb,
  FdrAPI,
  SDKSnippetHolder,
} from "@fern-api/fdr-sdk";
import urlJoin from "url-join";
import { v4 as uuidv4 } from "uuid";
import { APIV1WriteService } from "../../api";
import { SdkRequest } from "../../api/generated/api";
import type { FdrApplication } from "../../app";
import { LOGGER } from "../../app/FdrApplication";
import { SdkIdForPackage } from "../../db/sdk/SdkDao";
import {
  SnippetTemplatesByEndpoint,
  SnippetTemplatesByEndpointIdentifier,
} from "../../db/snippets/SnippetTemplate";
import { writeBuffer } from "../../util";

const REGISTER_API_DEFINITION_META = {
  service: "APIV1WriteService",
  endpoint: "registerApiDefinition",
};

export function getRegisterApiService(app: FdrApplication): APIV1WriteService {
  return new APIV1WriteService({
    registerApiDefinition: async (req, res) => {
      app.logger.debug(
        `Checking if user belongs to org ${req.body.orgId}`,
        REGISTER_API_DEFINITION_META
      );
      await app.services.auth.checkUserBelongsToOrg({
        authHeader: req.headers.authorization,
        orgId: req.body.orgId,
      });

      let apiDefinitionId = FdrAPI.ApiDefinitionId(uuidv4());
      let transformedApiDefinition:
        | APIV1Db.DbApiDefinition
        | FdrAPI.api.latest.ApiDefinition
        | undefined;

      const snippetsConfiguration = req.body.definition
        ?.snippetsConfiguration ??
        req.body.definitionV2?.snippetsConfiguration ?? {
          typescriptSdk: undefined,
          pythonSdk: undefined,
          javaSdk: undefined,
          goSdk: undefined,
          rubySdk: undefined,
          csharpSdk: undefined,
        };

      const snippetsConfigurationWithSdkIds = await app.dao
        .sdks()
        .getSdkIdsForPackages(snippetsConfiguration);
      const sdkIds: string[] = [];
      if (snippetsConfigurationWithSdkIds.typescriptSdk != null) {
        sdkIds.push(snippetsConfigurationWithSdkIds.typescriptSdk.sdkId);
      }
      if (snippetsConfigurationWithSdkIds.pythonSdk != null) {
        sdkIds.push(snippetsConfigurationWithSdkIds.pythonSdk.sdkId);
      }
      if (snippetsConfigurationWithSdkIds.javaSdk != null) {
        sdkIds.push(snippetsConfigurationWithSdkIds.javaSdk.sdkId);
      }
      if (snippetsConfigurationWithSdkIds.goSdk != null) {
        sdkIds.push(snippetsConfigurationWithSdkIds.goSdk.sdkId);
      }
      if (snippetsConfigurationWithSdkIds.rubySdk != null) {
        sdkIds.push(snippetsConfigurationWithSdkIds.rubySdk.sdkId);
      }
      if (snippetsConfigurationWithSdkIds.csharpSdk != null) {
        sdkIds.push(snippetsConfigurationWithSdkIds.csharpSdk.sdkId);
      }

      const snippetsBySdkId = await app.dao
        .snippets()
        .loadAllSnippetsForSdkIds(sdkIds);
      const snippetsBySdkIdAndEndpointId = await app.dao
        .snippets()
        .loadAllSnippetsForSdkIdsByEndpointId(sdkIds);
      let snippetTemplatesByEndpoint: SnippetTemplatesByEndpoint = {};
      let snippetTemplatesByEndpointId: SnippetTemplatesByEndpointIdentifier =
        {};

      snippetTemplatesByEndpoint = await getSnippetTemplatesIfEnabled({
        app,
        authorization: req.headers.authorization,
        orgId: req.body.orgId,
        apiId: req.body.apiId,
        definition: req.body.definition ?? req.body.definitionV2,
        snippetsConfigurationWithSdkIds,
      });
      snippetTemplatesByEndpointId =
        await getSnippetTemplatesByEndpointIdIfEnabled({
          app,
          authorization: req.headers.authorization,
          orgId: req.body.orgId,
          apiId: req.body.apiId,
          definition: req.body.definition ?? req.body.definitionV2,
          snippetsConfigurationWithSdkIds,
        });

      const snippetHolder = new SDKSnippetHolder({
        snippetsBySdkId,
        snippetsBySdkIdAndEndpointId,
        snippetsConfigWithSdkId: snippetsConfigurationWithSdkIds,
        snippetTemplatesByEndpoint,
        snippetTemplatesByEndpointId,
      });

      if (
        req.body.definition != null &&
        Object.keys(req.body.definition).length > 0
      ) {
        transformedApiDefinition = convertAPIDefinitionToDb(
          req.body.definition,
          apiDefinitionId,
          snippetHolder
        );
      }

      let isLatest = false;
      if (transformedApiDefinition == null) {
        if (
          req.body.definitionV2 == null ||
          (req.body.definitionV2 != null &&
            Object.keys(req.body.definitionV2).length === 0)
        ) {
          throw new Error("No latest definition provided");
        }
        transformedApiDefinition = enrichApiLatestDefinitionWithSnippets(
          req.body.definitionV2,
          snippetHolder
        );
        isLatest = true;
        apiDefinitionId = transformedApiDefinition.id;
      }

      let sources: Record<string, APIV1Write.SourceUpload> | undefined;
      if (req.body.sources != null) {
        app.logger.debug(
          `Preparing source upload URLs for {orgId: "${req.body.orgId}", apiId: "${req.body.apiId}"}`,
          REGISTER_API_DEFINITION_META
        );
        sources = await getSourceUploads({
          app,
          orgId: req.body.orgId,
          apiId: req.body.apiId,
          sources: req.body.sources,
        });
        app.logger.debug(
          "Successfully prepared source upload URLs",
          REGISTER_API_DEFINITION_META
        );
      }

      app.logger.debug(
        `Creating API Definition in database with id=${apiDefinitionId}, name=${req.body.apiId} for org ${req.body.orgId}`,
        REGISTER_API_DEFINITION_META
      );
      await (
        isLatest
          ? app.services.db.prisma.apiDefinitionsLatest
          : app.services.db.prisma.apiDefinitionsV2
      ).create({
        data: {
          apiDefinitionId,
          apiName: req.body.apiId,
          orgId: req.body.orgId,
          definition: writeBuffer(transformedApiDefinition),
        },
      });
      app.logger.debug(
        `Returning API Definition ID id=${apiDefinitionId}`,
        REGISTER_API_DEFINITION_META
      );
      return res.send({
        apiDefinitionId,
        sources,
      });
    },
  });
}

function stringifyEndpointPathParts(
  path: FdrAPI.api.latest.PathPart[]
): string {
  return urlJoin(
    ...path.map((part) =>
      part.type === "literal" ? part.value : `{${part.value}}`
    )
  );
}

function enrichApiLatestDefinitionWithSnippets(
  definition: FdrAPI.api.latest.ApiDefinition,
  snippetHolder: SDKSnippetHolder
): FdrAPI.api.latest.ApiDefinition {
  Object.entries(definition.endpoints).forEach(([_, endpoint]) => {
    endpoint.snippetTemplates = snippetHolder.getSnippetTemplateForEndpoint({
      endpointPath: FdrAPI.EndpointPathLiteral(
        stringifyEndpointPathParts(endpoint.path)
      ),
      endpointMethod: endpoint.method,
      endpointId: endpoint.id,
    });

    endpoint.examples?.forEach((example) => {
      const goSnippet = snippetHolder.getGoCodeSnippetForEndpoint({
        endpointPath: FdrAPI.EndpointPathLiteral(
          stringifyEndpointPathParts(endpoint.path)
        ),
        endpointMethod: endpoint.method,
        endpointId: endpoint.id,
        exampleId: example.name,
      });
      const pythonSnippet = snippetHolder.getPythonCodeSnippetForEndpoint({
        endpointPath: FdrAPI.EndpointPathLiteral(
          stringifyEndpointPathParts(endpoint.path)
        ),
        endpointMethod: endpoint.method,
        endpointId: endpoint.id,
        exampleId: example.name,
      });
      const rubySnippet = snippetHolder.getRubyCodeSnippetForEndpoint({
        endpointPath: FdrAPI.EndpointPathLiteral(
          stringifyEndpointPathParts(endpoint.path)
        ),
        endpointMethod: endpoint.method,
        endpointId: endpoint.id,
        exampleId: example.name,
      });
      const typescriptSnippet =
        snippetHolder.getTypeScriptCodeSnippetForEndpoint({
          endpointPath: FdrAPI.EndpointPathLiteral(
            stringifyEndpointPathParts(endpoint.path)
          ),
          endpointMethod: endpoint.method,
          endpointId: endpoint.id,
          exampleId: example.name,
        });
      const csharpSnippet = snippetHolder.getCsharpCodeSnippetForEndpoint({
        endpointPath: FdrAPI.EndpointPathLiteral(
          stringifyEndpointPathParts(endpoint.path)
        ),
        endpointMethod: endpoint.method,
        endpointId: endpoint.id,
        exampleId: example.name,
      });

      if (
        goSnippet != null &&
        (example.snippets?.go == null || example.snippets.go?.length === 0)
      ) {
        example.snippets ??= {};
        example.snippets.go ??= [];
        example.snippets.go.push({
          language: "go",
          code: goSnippet.client,
          install: goSnippet.install,
          generated: true,
          description: example.description,
          name: undefined,
        });
      }
      if (
        pythonSnippet != null &&
        (example.snippets?.python == null ||
          example.snippets.python?.length === 0)
      ) {
        example.snippets ??= {};
        example.snippets.python ??= [];
        example.snippets.python.push({
          language: "python",
          code: pythonSnippet.sync_client,
          install: pythonSnippet.install,
          generated: true,
          description: example.description,
          name: undefined,
        });
      }
      if (
        rubySnippet != null &&
        (example.snippets?.ruby == null || example.snippets.ruby?.length === 0)
      ) {
        example.snippets ??= {};
        example.snippets.ruby ??= [];
        example.snippets.ruby.push({
          language: "ruby",
          code: rubySnippet.client,
          install: rubySnippet.install,
          generated: true,
          description: example.description,
          name: undefined,
        });
      }
      if (
        typescriptSnippet != null &&
        (example.snippets?.typescript == null ||
          example.snippets.typescript?.length === 0)
      ) {
        example.snippets ??= {};
        example.snippets.typescript ??= [];
        example.snippets.typescript.push({
          language: "typescript",
          code: typescriptSnippet.client,
          install: typescriptSnippet.install,
          generated: true,
          description: example.description,
          name: undefined,
        });
      }
      if (
        csharpSnippet != null &&
        (example.snippets?.csharp == null ||
          example.snippets.csharp?.length === 0)
      ) {
        example.snippets ??= {};
        example.snippets.csharp ??= [];
        example.snippets.csharp.push({
          language: "csharp",
          code: csharpSnippet.client,
          install: csharpSnippet.install,
          generated: true,
          description: example.description,
          name: undefined,
        });
      }
    });
  });

  return definition;
}

function getSnippetSdkRequests({
  snippetsConfigurationWithSdkIds,
}: {
  snippetsConfigurationWithSdkIds: SdkIdForPackage;
}): SdkRequest[] {
  const sdkRequests: SdkRequest[] = [];
  if (snippetsConfigurationWithSdkIds.typescriptSdk != null) {
    sdkRequests.push({
      type: "typescript",
      package: snippetsConfigurationWithSdkIds.typescriptSdk.package,
      version: snippetsConfigurationWithSdkIds.typescriptSdk.version,
    });
  }
  if (snippetsConfigurationWithSdkIds.pythonSdk != null) {
    sdkRequests.push({
      type: "python",
      package: snippetsConfigurationWithSdkIds.pythonSdk.package,
      version: snippetsConfigurationWithSdkIds.pythonSdk.version,
    });
  }
  if (snippetsConfigurationWithSdkIds.javaSdk != null) {
    const coordinate = snippetsConfigurationWithSdkIds.javaSdk.coordinate;
    const [group, artifact] = coordinate.split(":");
    if (group == null || artifact == null) {
      throw new Error(
        `Invalid coordinate for Java SDK: ${coordinate}. Must be in the format group:artifact`
      );
    }
    sdkRequests.push({
      type: "java",
      group,
      artifact,
      version: snippetsConfigurationWithSdkIds.javaSdk.version,
    });
  }
  if (snippetsConfigurationWithSdkIds.goSdk != null) {
    sdkRequests.push({
      type: "go",
      githubRepo: snippetsConfigurationWithSdkIds.goSdk.githubRepo,
      version: snippetsConfigurationWithSdkIds.goSdk.version,
    });
  }
  if (snippetsConfigurationWithSdkIds.rubySdk != null) {
    sdkRequests.push({
      type: "ruby",
      gem: snippetsConfigurationWithSdkIds.rubySdk.gem,
      version: snippetsConfigurationWithSdkIds.rubySdk.version,
    });
  }
  return sdkRequests;
}

async function getSnippetTemplatesByEndpointIdIfEnabled({
  app,
  authorization,
  orgId,
  apiId,
  definition,
  snippetsConfigurationWithSdkIds,
}: {
  app: FdrApplication;
  authorization: string | undefined;
  orgId: FdrAPI.OrgId;
  apiId: FdrAPI.ApiId;
  definition:
    | APIV1Write.ApiDefinition
    | FdrAPI.api.latest.ApiDefinition
    | undefined;
  snippetsConfigurationWithSdkIds: SdkIdForPackage;
}): Promise<SnippetTemplatesByEndpointIdentifier> {
  try {
    if (definition == null) {
      return {};
    }
    const hasSnippetTemplatesAccess =
      await app.services.auth.checkOrgHasSnippetTemplateAccess({
        authHeader: authorization,
        orgId,
        failHard: false,
      });
    let snippetTemplatesByEndpoint: SnippetTemplatesByEndpointIdentifier = {};
    if (hasSnippetTemplatesAccess) {
      const sdkRequests = getSnippetSdkRequests({
        snippetsConfigurationWithSdkIds,
      });
      snippetTemplatesByEndpoint = await app.dao
        .snippetTemplates()
        .loadSnippetTemplatesByEndpointIdentifier({
          orgId,
          apiId,
          sdkRequests,
          definition,
        });
    }
    return snippetTemplatesByEndpoint;
  } catch (e) {
    LOGGER.error("Failed to load snippet templates", e);
    return {};
  }
}

async function getSnippetTemplatesIfEnabled({
  app,
  authorization,
  orgId,
  apiId,
  definition,
  snippetsConfigurationWithSdkIds,
}: {
  app: FdrApplication;
  authorization: string | undefined;
  orgId: FdrAPI.OrgId;
  apiId: FdrAPI.ApiId;
  definition:
    | APIV1Write.ApiDefinition
    | FdrAPI.api.latest.ApiDefinition
    | undefined;
  snippetsConfigurationWithSdkIds: SdkIdForPackage;
}): Promise<SnippetTemplatesByEndpoint> {
  try {
    if (definition == null) {
      return {};
    }
    const hasSnippetTemplatesAccess =
      await app.services.auth.checkOrgHasSnippetTemplateAccess({
        authHeader: authorization,
        orgId,
        failHard: false,
      });
    let snippetTemplatesByEndpoint: SnippetTemplatesByEndpoint = {};
    if (hasSnippetTemplatesAccess) {
      const sdkRequests = getSnippetSdkRequests({
        snippetsConfigurationWithSdkIds,
      });
      snippetTemplatesByEndpoint = await app.dao
        .snippetTemplates()
        .loadSnippetTemplatesByEndpoint({
          orgId,
          apiId,
          sdkRequests,
          definition,
        });
    }
    return snippetTemplatesByEndpoint;
  } catch (e) {
    LOGGER.error("Failed to load snippet templates", e);
    return {};
  }
}

async function getSourceUploads({
  app,
  orgId,
  apiId,
  sources,
}: {
  app: FdrApplication;
  orgId: FdrAPI.OrgId;
  apiId: FdrAPI.ApiId;
  sources: Record<string, APIV1Write.Source>;
}): Promise<Record<string, APIV1Write.SourceUpload>> {
  const sourceUploadUrls =
    await app.services.s3.getPresignedApiDefinitionSourceUploadUrls({
      orgId,
      apiId,
      sources,
    });

  const sourceUploads = await Promise.all(
    Object.entries(sourceUploadUrls).map(async ([sourceId, fileInfo]) => {
      const downloadUrl =
        await app.services.s3.getPresignedApiDefinitionSourceDownloadUrl({
          key: fileInfo.key,
        });

      return [
        sourceId,
        {
          uploadUrl: fileInfo.presignedUrl,
          downloadUrl,
        },
      ];
    })
  );

  return Object.fromEntries(sourceUploads);
}
