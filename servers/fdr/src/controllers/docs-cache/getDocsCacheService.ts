import { DocsCacheService } from "../../api/generated/api/resources/docsCache/service/DocsCacheService";
import { type FdrApplication } from "../../app";
import { ParsedBaseUrl } from "../../util/ParsedBaseUrl";

export function getDocsCacheService(app: FdrApplication): DocsCacheService {
  return new DocsCacheService({
    invalidate: async (req, res) => {
      await app.docsDefinitionCache.invalidateCache(
        ParsedBaseUrl.parse(req.body.url).toURL()
      );
      return res.send();
    },
  });
}
