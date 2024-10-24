import { convertDbAPIDefinitionToRead } from "@fern-api/fdr-sdk";
import { APIV1ReadService } from "../../api";
import { UserNotInOrgError } from "../../api/generated/api";
import { ApiDoesNotExistError } from "../../api/generated/api/resources/api/resources/v1/resources/read/errors";
import type { FdrApplication } from "../../app";

export function getReadApiService(app: FdrApplication): APIV1ReadService {
    return new APIV1ReadService({
        getApi: async (req, res) => {
            try {
                // if the auth header belongs to fern, return the api definition
                await app.services.auth.checkUserBelongsToOrg({
                    authHeader: req.headers.authorization,
                    orgId: "fern",
                });
            } catch (e) {
                if (e instanceof UserNotInOrgError) {
                    const orgId = await app.dao.apis().getOrgIdForApiDefinition(req.params.apiDefinitionId);
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
            const dbApiDefinition = await app.dao.apis().loadAPIDefinition(req.params.apiDefinitionId);
            if (dbApiDefinition == null) {
                throw new ApiDoesNotExistError();
            }
            const readApiDefinition = convertDbAPIDefinitionToRead(dbApiDefinition);
            return res.send(readApiDefinition);
        },
    });
}
