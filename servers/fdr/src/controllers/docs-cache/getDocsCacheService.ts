import { DocsCacheService } from "../../api/generated/api/resources/docsCache/service/DocsCacheService";
import { type FdrApplication } from "../../app";

export function getDocsCacheService(app: FdrApplication): DocsCacheService {
    return new DocsCacheService({
        invalidate: async (req, res) => {
            app.docsDefinitionCache.getOrganizationForUrl;
        },
    });
}
