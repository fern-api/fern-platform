import { APILatestService } from "../../api";
import { UserNotInOrgError } from "../../api/generated/api";
import { ApiDoesNotExistError } from "../../api/generated/api/resources/api/resources/v1/resources/read/errors";
import type { FdrApplication } from "../../app";

export function getApiLatestService(app: FdrApplication): APILatestService {
  return new APILatestService({
    getApiLatest: async (req, res) => {
      try {
        // if the auth header belongs to fern, return the api definition
        await app.services.auth.checkUserBelongsToOrg({
          authHeader: req.headers.authorization,
          orgId: "fern",
        });
      } catch (e) {
        if (e instanceof UserNotInOrgError) {
          const orgId = await app.dao
            .apis()
            .getOrgIdForApiDefinition(req.params.apiDefinitionId);
          if (orgId == null) {
            throw new ApiDoesNotExistError();
          }
          await app.services.auth.checkUserBelongsToOrg({
            authHeader: req.headers.authorization,
            orgId,
          });
        }
        throw e;
      }
      const apiDefinition = await app.dao
        .apis()
        .loadAPILatestDefinition(req.params.apiDefinitionId);
      if (apiDefinition == null) {
        throw new ApiDoesNotExistError();
      }
      return res.send(apiDefinition);
    },
  });
}
