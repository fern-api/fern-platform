import { Fern, FernClient } from "@fern-api/sdk";
import { Templates } from "@fern-api/sdk/api/resources/templates/client/Client";
import { useEffect, useState } from "react";

const fern = new FernClient({
    token: "FERN_API_TOKEN_IS_ON_1PASSWORD",
});

type Template = Awaited<ReturnType<typeof fern.templates.get>>;
export type FernTemplateOptions = {
    request: Fern.GetSnippetTemplate;
    requestOptions: Templates.RequestOptions;
};

export const useFernTemplate = ({ request, requestOptions }: FernTemplateOptions) => {
    const [template, setTemplate] = useState<Template>();

    useEffect(() => {
        const getTemplate = async () => {
            try {
                const template = await fern.templates.get(request, requestOptions);
                setTemplate(template);
            } catch (e) {
                console.error(e);
            }
        };

        getTemplate();
    }, [request, requestOptions]);

    return {
        template,
    };
};
