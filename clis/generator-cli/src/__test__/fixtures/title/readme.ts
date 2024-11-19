import { FernGeneratorCli } from "../../../configuration/generated";

const CONFIG: FernGeneratorCli.ReadmeConfig = {
    language: FernGeneratorCli.LanguageInfo.go({
        publishInfo: {
            owner: "basic",
            repo: "basic-go",
            version: "0.0.1",
        },
    }),
    organization: "title",
    features: [
        {
            id: "USAGE",
            title: "My custom title!",
            description: "Instantiate the client with the following:\n",
            snippets: [
                'import (\n\tfern "github.com/custom/fern"\n\tfernclient "github.com/custom/fern/client"\n\toption "github.com/custom/fern/option"\n)\n\nclient := fernclient.NewClient(\n\toption.WithToken(\n\t\t"\u003cYOUR_AUTH_TOKEN\u003e",\n\t),\n)\nresponse, err := client.Chat(\n\tctx,\n\t\u0026fern.ChatRequest{\n\t\tMessage: "Can you give me a global market overview of solar panels?",\n\t},\n)\n',
            ],
            snippetsAreOptional: true,
        },
    ],
};

export default CONFIG;
