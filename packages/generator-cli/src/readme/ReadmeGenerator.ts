import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import fs from "fs";
import { camelCase, upperFirst } from "lodash-es";
import { FernGeneratorCli } from "../configuration/generated";
import { StreamWriter, StringWriter, Writer } from "../utils/Writer";
import { Block } from "./Block";
import { BlockMerger } from "./BlockMerger";
import { ReadmeParser } from "./ReadmeParser";

export class ReadmeGenerator {
    private readmeParser: ReadmeParser;
    private readmeConfig: FernGeneratorCli.ReadmeConfig;
    private featuresConfig: FernGeneratorCli.FeaturesConfig;
    private snippets: FernGeneratorExec.Snippets;
    private originalReadme: string | undefined;
    private organization: string;
    private language: string;

    constructor({
        readmeParser,
        readmeConfig,
        featuresConfig,
        snippets,
        originalReadme,
    }: {
        readmeParser: ReadmeParser;
        readmeConfig: FernGeneratorCli.ReadmeConfig;
        featuresConfig: FernGeneratorCli.FeaturesConfig;
        snippets: FernGeneratorExec.Snippets;
        originalReadme: string | undefined;
    }) {
        this.readmeParser = readmeParser;
        this.readmeConfig = readmeConfig;
        this.featuresConfig = featuresConfig;
        this.snippets = snippets;
        this.originalReadme = originalReadme;
        this.organization = pascalCase(this.readmeConfig.organization);
        this.language = pascalCase(this.readmeConfig.language);
    }

    public async generateReadme({ output }: { output: fs.WriteStream }): Promise<void> {
        const blocks: Block[] = [];

        if (this.snippets.requirements != null) {
            blocks.push(this.generateRequirements({ requirements: this.snippets.requirements }));
        }
        if (this.readmeConfig.publishInfo != null) {
            blocks.push(this.generateInstallation({ publishInfo: this.readmeConfig.publishInfo }));
        }

        for (const feature of this.featuresConfig.features) {
            const endpoints = this.getEndpointsForFeature({ feature });
            if (endpoints.length === 0) {
                // If no snippets were generated, we ignore the feature.
                continue;
            }
            blocks.push(
                this.generateFeatureBlock({
                    feature,
                    endpoints,
                }),
            );
        }

        blocks.push(this.generateContributing());

        const writer = new StreamWriter(output);
        this.writeHeader({ writer });
        this.writeBlocks({
            writer,
            blocks: this.mergeBlocks({ blocks }),
        });
        writer.end();

        return;
    }

    private mergeBlocks({ blocks }: { blocks: Block[] }): Block[] {
        if (this.originalReadme == null) {
            return blocks;
        }
        const parsed = this.readmeParser.parse({ content: this.originalReadme });
        const merger = new BlockMerger({
            original: parsed.blocks,
            updated: blocks,
        });
        return merger.merge();
    }

    private writeBlocks({ writer, blocks }: { writer: Writer; blocks: Block[] }): void {
        for (const block of blocks) {
            block.write(writer);
        }
    }

    private getEndpointsForFeature({ feature }: { feature: FernGeneratorCli.Feature }): FernGeneratorExec.Endpoint[] {
        const endpoints = this.snippets.features?.[feature.id];
        if (endpoints == null || endpoints.length === 0 || endpoints[0] == null) {
            return [];
        }
        const endpointIds =
            this.readmeConfig.featureEndpoints != null ? this.readmeConfig.featureEndpoints[feature.id] : [];
        if (endpointIds == null || endpointIds.length === 0) {
            // The user didn't choose a particular endpoint for this feature, so
            // we arbitrarily choose the first snippet.
            //
            // TODO: We could expose a default endpoint in the readme config to use instead.
            return [endpoints[0]];
        }
        const filtered = endpoints.filter((endpoint) => {
            return endpointIds.some((endpointId) => {
                return endpoint.id.identifierOverride === endpointId;
            });
        });
        if (filtered.length !== endpointIds.length) {
            throw new Error(
                `feature ${feature.id} requested endpoint snippets ${JSON.stringify(endpointIds)} but only found ${JSON.stringify(filtered.map((s) => s.id.identifierOverride))}`,
            );
        }
        return filtered;
    }

    private generateFeatureBlock({
        feature,
        endpoints,
    }: {
        feature: FernGeneratorCli.Feature;
        endpoints: FernGeneratorExec.Endpoint[];
    }): Block {
        const writer = new StringWriter();
        writer.writeLine(`## ${feature.title != null ? feature.title : featureIDToTitle(feature.id)}`);
        writer.writeLine();
        if (feature.description != null) {
            writer.writeLine(feature.description);
        }
        endpoints.forEach((endpoint, index) => {
            if (index > 0) {
                writer.writeLine();
            }
            const snippet = endpoint.snippet;
            switch (snippet.type) {
                case "typescript":
                    writer.writeCodeBlock(snippet.type, snippet.client);
                    break;
                case "python":
                    writer.writeCodeBlock(snippet.type, snippet.syncClient);
                    break;
                case "go":
                    writer.writeCodeBlock(snippet.type, snippet.client);
                    break;
                case "java":
                    writer.writeCodeBlock(snippet.type, snippet.syncClient);
                    break;
                case "ruby":
                    writer.writeCodeBlock(snippet.type, snippet.client);
                    break;
                default:
                    assertNever(snippet);
            }
        });
        if (feature.addendum != null) {
            writer.writeLine(feature.addendum);
        }
        writer.writeLine();
        return new Block({
            id: feature.id,
            content: writer.toString(),
        });
    }

    private writeHeader({ writer }: { writer: Writer }): void {
        writer.writeLine(`# ${this.organization} ${this.language} Library`);
        writer.writeLine();
        if (this.readmeConfig.bannerLink != null) {
            this.writeBanner({ writer, bannerLink: this.readmeConfig.bannerLink });
        }
        this.writeFernShield({ writer });
        if (this.readmeConfig.publishInfo != null) {
            this.writeShield({
                writer,
                publishInfo: this.readmeConfig.publishInfo,
            });
        }
        writer.writeLine();
        writer.writeLine(
            `The ${this.organization} ${this.language} library provides convenient access to the ${this.organization} API from ${this.language}.`,
        );
        writer.writeLine();
    }

    private writeBanner({ writer, bannerLink }: { writer: Writer; bannerLink: string }): void {
        writer.writeLine(`![](${bannerLink})`);
        writer.writeLine();
    }

    private writeFernShield({ writer }: { writer: Writer }): void {
        writer.writeLine(
            "[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-SDK%20generated%20by%20Fern-brightgreen)](https://github.com/fern-api/fern)",
        );
    }

    private generateRequirements({ requirements }: { requirements: string[] }): Block {
        const writer = new StringWriter();
        writer.writeLine("## Requirements");
        writer.writeLine();
        if (requirements.length === 1) {
            writer.writeLine(`This SDK requires ${requirements[0]}`);
        } else {
            writer.writeLine("This SDK requires:");
            for (const requirement of requirements) {
                writer.writeLine(`- ${requirement}`);
            }
        }
        writer.writeLine();
        return new Block({
            id: "REQUIREMENTS",
            content: writer.toString(),
        });
    }

    private generateInstallation({ publishInfo }: { publishInfo: FernGeneratorCli.PublishInfo }): Block {
        const writer = new StringWriter();
        writer.writeLine("## Installation");
        writer.writeLine();
        switch (publishInfo.type) {
            case "npm":
                this.writeInstallationForNPM({
                    writer,
                    npm: publishInfo,
                });
                break;
            case "pypi":
                this.writeInstallationForPyPi({
                    writer,
                    pypi: publishInfo,
                });
                break;
            case "maven":
                this.writeInstallationForMaven({
                    writer,
                    maven: publishInfo,
                });
                break;
            case "go":
                this.writeInstallationForGo({
                    writer,
                    go: publishInfo,
                });
                break;
            default:
                // TODO: Not all the registries are supported by the README.md generator yet.
                assertNever(publishInfo);
        }
        return new Block({
            id: "INSTALLATION",
            content: writer.toString(),
        });
    }

    private writeInstallationForNPM({ writer, npm }: { writer: Writer; npm: FernGeneratorCli.NpmPublishInfo }): void {
        writer.writeLine("```sh");
        writer.writeLine(`npm i -s ${npm.packageName}`);
        writer.writeLine("```");
        writer.writeLine();
    }

    private writeInstallationForPyPi({
        writer,
        pypi,
    }: {
        writer: Writer;
        pypi: FernGeneratorCli.PypiPublishInfo;
    }): void {
        writer.writeLine("```sh");
        writer.writeLine(`pip install ${pypi.packageName}`);
        writer.writeLine("```");
        writer.writeLine();
    }

    private writeInstallationForMaven({
        writer,
        maven,
    }: {
        writer: Writer;
        maven: FernGeneratorCli.MavenPublishInfo;
    }): void {
        writer.writeLine("### Gradle");
        writer.writeLine();
        writer.writeLine("Add the dependency in your `build.gradle` file:");
        writer.writeLine();
        writer.writeLine("```groovy");
        writer.writeLine("dependencies {");
        writer.writeLine(`  implementation '${maven.group}:${maven.artifact}'`);
        writer.writeLine("}");
        writer.writeLine("```");
        writer.writeLine();

        writer.writeLine("### Maven");
        writer.writeLine();
        writer.writeLine("Add the dependency in your `pom.xml` file:");
        writer.writeLine();
        writer.writeLine("```xml");
        writer.writeLine("<dependency>");
        writer.writeLine(`  <groupId>${maven.group}</groupId>`);
        writer.writeLine(`  <artifactId>${maven.artifact}</artifactId>`);
        writer.writeLine(`  <version>${maven.version}</version>`);
        writer.writeLine("</dependency>");
        writer.writeLine("```");
        writer.writeLine();
    }

    private writeInstallationForGo({ writer, go }: { writer: Writer; go: FernGeneratorCli.GoPublishInfo }): void {
        writer.writeLine("```sh");
        writer.write(`go get github.com/${go.owner}/${go.repo}`);
        const majorVersion = getMajorVersion(go.version);
        if (!majorVersion.startsWith("v0") || !majorVersion.startsWith("v1")) {
            // For Go, we need to append the major version to the module path for any release greater than v1.X.X.
            writer.write(`/${majorVersion}`);
        }
        writer.writeLine();
        writer.writeLine("```");
        writer.writeLine();
    }

    private writeShield({ writer, publishInfo }: { writer: Writer; publishInfo: FernGeneratorCli.PublishInfo }): void {
        switch (publishInfo.type) {
            case "npm":
                this.writeShieldForNPM({
                    writer,
                    npm: publishInfo,
                });
                return;
            case "pypi":
                this.writeShieldForPyPi({
                    writer,
                    pypi: publishInfo,
                });
                return;
            case "maven":
                this.writeShieldForMaven({
                    writer,
                    maven: publishInfo,
                });
                return;
            case "go":
                this.writeShieldForGo({
                    writer,
                    go: publishInfo,
                });
                return;
            default:
                // TODO: Not all the registries are supported by the README.md generator yet.
                assertNever(publishInfo);
        }
    }

    private writeShieldForNPM({ writer, npm }: { writer: Writer; npm: FernGeneratorCli.NpmPublishInfo }): void {
        writer.write("[![npm shield]");
        writer.write(`(https://img.shields.io/npm/v/${npm.packageName})]`);
        writer.writeLine(`(https://www.npmjs.com/package/${npm.packageName})`);
    }

    private writeShieldForPyPi({ writer, pypi }: { writer: Writer; pypi: FernGeneratorCli.PypiPublishInfo }): void {
        writer.write("[![pypi]");
        writer.write(`(https://img.shields.io/pypi/v/${pypi.packageName})]`);
        writer.writeLine(`(https://pypi.python.org/pypi/${pypi.packageName})`);
    }

    private writeShieldForMaven({ writer, maven }: { writer: Writer; maven: FernGeneratorCli.MavenPublishInfo }): void {
        writer.write("[![Maven Central]");
        writer.write(`(https://img.shields.io/maven-central/v/${maven.artifact})]`);
        writer.writeLine(`(https://central.sonatype.com/artifact/${maven.group}/${maven.artifact})`);
    }

    private writeShieldForGo({ writer, go }: { writer: Writer; go: FernGeneratorCli.GoPublishInfo }): void {
        writer.write("[![go shield]");
        writer.write("(https://img.shields.io/badge/go-docs-blue)]");
        writer.writeLine(`(https://pkg.go.dev/github.com/${go.owner}/${go.repo})`);
    }

    private generateContributing(): Block {
        return new Block({
            id: "contributing",
            content: `## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!
`,
        });
    }
}

function featureIDToTitle(featureID: string): string {
    return pascalCase(featureID);
}

function pascalCase(s: string): string {
    return upperFirst(camelCase(s));
}

function getMajorVersion(version: string): string {
    return version.split(".")[0] ?? "v0";
}

function assertNever(x: never): never {
    throw new Error("Unexpected value: " + JSON.stringify(x));
}
