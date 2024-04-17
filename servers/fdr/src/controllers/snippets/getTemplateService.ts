import { TemplateService } from "../../api";
import { SnippetNotFound } from "../../api/generated/api";
import { type FdrApplication } from "../../app";

export function getTemplateService(app: FdrApplication): TemplateService {
    return new TemplateService({
        register: async (req, res) => {
            await app.dao.snippetTemplates().storeSnippetTemplate({
                storeSnippetsInfo: {
                    ...req.body,
                    snippets: [req.body.snippet],
                },
            });
            return res.send();
        },
        registerBatch: async (req, res) => {
            await app.dao.snippetTemplates().storeSnippetTemplate({
                storeSnippetsInfo: req.body,
            });
            return res.send();
        },
        get: async (req, res) => {
            const snippet = await app.dao.snippetTemplates().loadSnippetTemplate({
                loadSnippetTemplateRequest: req.body,
            });
            if (snippet == null) {
                throw new SnippetNotFound("The requested snippet could not be found.");
            }
            return res.send(snippet);
        },
    });
}
