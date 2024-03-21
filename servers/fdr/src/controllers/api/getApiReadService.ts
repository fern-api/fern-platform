import { APIV1Read, APIV1ReadService } from "../../api";
import type { FdrApplication } from "../../app";
import { convertDbAPIDefinitionToRead } from "@fern-api/fdr-sdk";

export function getReadApiService(app: FdrApplication): APIV1ReadService {
    return new APIV1ReadService({
        getApi: async (req, res) => {
            const dbApiDefinition = await app.dao.apis().loadAPIDefinition(req.params.apiDefinitionId);
            if (dbApiDefinition == null) {
                throw new APIV1Read.ApiDoesNotExistError();
            }
            const readApiDefinition = convertDbAPIDefinitionToRead(dbApiDefinition);
            return res.send(readApiDefinition);
        },
    });
}
