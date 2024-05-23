import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import fs from "fs";
import { readFile } from "fs/promises";
import tmp from "tmp-promise";
import { ReadmeGenerator } from "../ReadmeGenerator";

describe("readme generator", () => {
    it("basic (static)", async () => {
        const generator = new ReadmeGenerator(
            {
                bannerLink:
                    "https://raw.githubusercontent.com/cohere-ai/cohere-typescript/5188b11a6e91727fdd4d46f4a690419ad204224d/banner.png",
                docsLink: "https://docs.cohere.com",
                installation: `Run the following command to use the Cohere Go library in your module:
                    \`\`\`sh
                    go get github.com/cohere-ai/cohere-go
                    \`\`\` 
                `,
                requirements: "This module requires Go version >= 1.18.",
                features: [
                    {
                        name: "usage",
                        endpoints: [
                            {
                                id: {
                                    method: "POST",
                                    path: FernGeneratorExec.EndpointPath("/chat"),
                                },
                            },
                        ],
                    },
                    {
                        name: "timeouts",
                        endpoints: [
                            {
                                id: {
                                    method: "POST",
                                    path: FernGeneratorExec.EndpointPath("/generate"),
                                },
                            },
                        ],
                    },
                ],
            },
            {
                features: [
                    {
                        name: "usage",
                        description: "Instantiate the client and call endpoints like so:",
                    },
                    {
                        name: "timeouts",
                        description:
                            "Setting a timeout for each individual request is as simple as using the standard `context` library. Setting a one second timeout for an individual API call looks like the following:",
                    },
                ],
            },
            {
                types: {},
                endpoints: [
                    {
                        id: {
                            method: "POST",
                            path: FernGeneratorExec.EndpointPath("/chat"),
                        },
                        snippet: FernGeneratorExec.EndpointSnippet.go({
                            client: `
                                    import cohereclient "github.com/cohere-ai/cohere-go/v2/client"

                                    client := cohereclient.NewClient(
                                        cohereclient.WithToken(
                                            "<YOUR_AUTH_TOKEN>",
                                        ),
                                    ) 
                                    response, err := client.Chat(
                                        context.TODO(),
                                        &cohere.ChatRequest{
                                            Message: "How is the weather today?",
                                        },
                                    )`,
                        }),
                    },
                    {
                        id: {
                            method: "POST",
                            path: FernGeneratorExec.EndpointPath("/generate"),
                        },
                        snippet: FernGeneratorExec.EndpointSnippet.go({
                            client: `
                                    import cohereclient "github.com/cohere-ai/cohere-go/v2/client"

                                    client := cohereclient.NewClient(
                                        cohereclient.WithToken(
                                            "<YOUR_AUTH_TOKEN>",
                                        ),
                                    ) 
                                    response, err := client.Generate(
                                        context.TODO(),
                                        &cohere.GenerateRequest{
                                          Prompt: "invalid prompt",
                                        },
                                    )`,
                        }),
                    },
                ],
            },
        );
        const file = await tmp.file();
        const output = fs.createWriteStream(file.path);
        await generator.generateReadme(output);

        expect(await readFile(file.path, "utf8")).toBe("# Hello!\n");
    });
});
