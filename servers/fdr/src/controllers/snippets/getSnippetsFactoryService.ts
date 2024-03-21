import { SnippetsFactoryService } from "../../api";
import { type FdrApplication } from "../../app";

export function getSnippetsFactoryService(app: FdrApplication): SnippetsFactoryService {
    return new SnippetsFactoryService({
        createSnippetsForSdk: async (req, res) => {
            await app.dao.snippets().storeSnippets({
                storeSnippetsInfo: {
                    orgId: req.body.orgId,
                    apiId: req.body.apiId,
                    sdk: req.body.snippets,
                },
            });
            return res.send();
        },
    });
}
