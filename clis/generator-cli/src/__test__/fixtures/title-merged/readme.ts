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
            title: "My custom title!!!",
            description: "This section has now changed!!",
            snippetsAreOptional: true,
        },
    ],
};

export default CONFIG;
