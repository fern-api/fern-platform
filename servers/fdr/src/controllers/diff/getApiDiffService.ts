import { APIV1Db, FdrAPI } from "@fern-api/fdr-sdk";

import { DiffService } from "../../api";
import {
  PathParameter,
  PathParameterDiff,
  QueryParameter,
  QueryParameterDiff,
} from "../../api/generated/api";
import { ApiDoesNotExistError } from "../../api/generated/api/resources/api/resources/v1/resources/read/errors";
import { type FdrApplication } from "../../app";

export function getApiDiffService(app: FdrApplication): DiffService {
  return new DiffService({
    diff: async (req, res) => {
      const previous = await app.dao
        .apis()
        .loadAPIDefinition(req.query.previousApiDefinitionId);
      const current = await app.dao
        .apis()
        .loadAPIDefinition(req.query.currentApiDefinitionId);

      if (!previous || !current) {
        throw new ApiDoesNotExistError();
      }

      const previousEndpoints = getEndpoints(previous);
      const currentEndpoints = getEndpoints(current);

      const visitedEndpoints = new Set<string>();
      const addedEndpoints: FdrAPI.AddedEndpoint[] = [];
      const updatedEndpoints: FdrAPI.UpdatedEndpoint[] = [];
      for (const [endpointId, currentEndpoint] of Object.entries(
        currentEndpoints
      )) {
        const previousEndpoint =
          previousEndpoints[FdrAPI.EndpointId(endpointId)];
        const endpointIdentifier = {
          method: currentEndpoint.method,
          path: getEndpointPath(currentEndpoint),
          identifierOverride: currentEndpoint.id,
        };
        if (previousEndpoint == null) {
          addedEndpoints.push({
            id: endpointIdentifier,
          });
          continue;
        } else {
          const endpointDiff: FdrAPI.UpdatedEndpoint = {
            id: endpointIdentifier,
            pathParameterDiff: getPathParameterDiff({
              previous: previousEndpoint,
              current: currentEndpoint,
            }),
            queryParameterDiff: getQueryParameterDiff({
              previous: previousEndpoint,
              current: currentEndpoint,
            }),
            requestBodyDiff: {
              added: [],
              removed: [],
            },
            responseBodyDiff: {
              added: [],
              removed: [],
            },
          };
          updatedEndpoints.push(endpointDiff);
        }
        visitedEndpoints.add(endpointId);
      }
      return res.send({
        addedEndpoints,
        updatedEndpoints,
        removedEndpoints: [],
        markdown: generateMarkdownChangelog({
          added: addedEndpoints,
          updated: updatedEndpoints,
        }),
      });
    },
  });
}

function generateMarkdownChangelog({
  added,
  updated,
}: {
  added: FdrAPI.AddedEndpoint[];
  updated: FdrAPI.UpdatedEndpoint[];
}): string {
  let markdown = "";
  if (added.length > 0) {
    markdown += `The following endpoints were added:
`;
    for (const addEndpont of added) {
      markdown += `  - \`${addEndpont.id.method} ${addEndpont.id.path}\` \n`;
    }
  }

  if (updated.length > 0) {
    markdown += `The following endpoints were updated:
`;

    for (const updateEndpoint of updated) {
      const newPathParams: string[] = [];
      if (updateEndpoint.pathParameterDiff.added.length > 0) {
        updateEndpoint.pathParameterDiff.added.map((param) => {
          newPathParams.push(param.wireKey);
        });
      }

      const newQueryParams: string[] = [];
      if (updateEndpoint.pathParameterDiff.added.length > 0) {
        updateEndpoint.pathParameterDiff.added.map((param) => {
          newQueryParams.push(param.wireKey);
        });
      }

      let withUpdates = "with ";
      let addAnd = false;
      if (newPathParams.length > 0) {
        withUpdates += `query parameters ${newQueryParams.map((param) => `\`${param}\``).join(", ")}`;
        addAnd = true;
      }

      if (newPathParams.length > 0) {
        if (addAnd) {
          withUpdates += " and ";
        }
        withUpdates += `path parameters ${newPathParams.map((param) => `\`${param}\``).join(", ")}`;
      }

      markdown += `  - ${updateEndpoint.id.method} ${updateEndpoint.id.path} ${withUpdates}. `;
    }
  }

  for (const addedEndpoint of added) {
    markdown += `  - ${addedEndpoint.id.method} ${addedEndpoint.id.path}`;
  }

  return markdown;
}

function getPathParameterDiff({
  previous,
  current,
}: {
  previous: APIV1Db.DbEndpointDefinition;
  current: APIV1Db.DbEndpointDefinition;
}): PathParameterDiff {
  const added: PathParameter[] = [];
  const removed: PathParameter[] = [];
  for (const currentParameter of current.path.pathParameters) {
    const previousParameter = previous.path.pathParameters.find(
      (maybePreviousParameter) => {
        maybePreviousParameter.key === currentParameter.key;
      }
    );
    if (previousParameter == null) {
      added.push({
        wireKey: currentParameter.key,
      });
    }
  }
  return {
    added,
    removed,
  };
}

function getQueryParameterDiff({
  previous,
  current,
}: {
  previous: APIV1Db.DbEndpointDefinition;
  current: APIV1Db.DbEndpointDefinition;
}): QueryParameterDiff {
  const added: QueryParameter[] = [];
  const removed: QueryParameter[] = [];
  for (const currentParameter of current.path.pathParameters) {
    const previousParameter = previous.path.pathParameters.find(
      (maybePreviousParameter) => {
        maybePreviousParameter.key === currentParameter.key;
      }
    );
    if (previousParameter == null) {
      added.push({
        wireKey: currentParameter.key,
      });
    }
  }
  return {
    added,
    removed,
  };
}

function getEndpoints(
  apiDefinition: APIV1Db.DbApiDefinition
): Record<FdrAPI.EndpointId, APIV1Db.DbEndpointDefinition> {
  const endpoints: Record<string, APIV1Db.DbEndpointDefinition> = {};
  apiDefinition.rootPackage.endpoints.forEach((endpoint) => {
    endpoints[getEndpointId(endpoint)] = endpoint;
  });
  Object.values(apiDefinition.subpackages).forEach((subpackage) => {
    subpackage.endpoints.forEach((endpoint) => {
      endpoints[getEndpointId(endpoint)] = endpoint;
    });
  });
  return endpoints;
}

function getEndpointId(
  endpoint: APIV1Db.DbEndpointDefinition
): FdrAPI.EndpointId {
  const path = getEndpointPath(endpoint);
  return FdrAPI.EndpointId(`${endpoint.method}_${path}`);
}

function getEndpointPath(
  endpoint: APIV1Db.DbEndpointDefinition
): FdrAPI.EndpointPathLiteral {
  let path = "";
  for (const part of endpoint.path.parts) {
    if (part.type === "literal") {
      path += part.value;
    } else {
      path += `{${part.value}}`;
    }
  }
  return FdrAPI.EndpointPathLiteral(path);
}
