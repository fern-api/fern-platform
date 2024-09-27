import { convertDbAPIDefinitionToRead } from "@fern-api/fdr-sdk";
import { APIV1ReadService } from "../../api";
import { ApiDoesNotExistError } from "../../api/generated/api/resources/api/resources/v1/resources/read/errors";
import type { FdrApplication } from "../../app";

export function getReadApiService(app: FdrApplication): APIV1ReadService {
    return new APIV1ReadService({
        getApi: async (req, res) => {
            const dbApiDefinition = await app.dao.apis().loadAPIDefinition(req.params.apiDefinitionId);
            if (dbApiDefinition == null) {
                throw new ApiDoesNotExistError();
            }
            const readApiDefinition = convertDbAPIDefinitionToRead(dbApiDefinition);
            return res.send(readApiDefinition);
        },
    });
}
