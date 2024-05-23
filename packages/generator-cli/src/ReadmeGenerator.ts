import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import fs from "fs";
import { Block } from "./Block";
import { BlockMerger } from "./BlockMerger";
import { ReadmeParser } from "./ReadmeParser";
import { StreamWriter, StringWriter, Writer } from "./Writer";
import { ReadmeConfig } from "./configuration/ReadmeConfig";
import { FernGeneratorCli } from "./configuration/generated";
import { FEATURE_TITLES } from "./constants";

export class ReadmeGenerator {
    private readmeParser: ReadmeParser;
    private readmeConfig: ReadmeConfig;
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
        readmeConfig: ReadmeConfig;
        featuresConfig: FernGeneratorCli.FeaturesConfig;
        snippets: FernGeneratorExec.Snippets;
        originalReadme: string | undefined;
    }) {
        this.readmeParser = readmeParser;
        this.readmeConfig = readmeConfig;
        this.featuresConfig = featuresConfig;
        this.snippets = snippets;
        this.originalReadme = originalReadme;
        this.organization = titleCase(this.readmeConfig.organization); // TODO: This won't work for organizations with a '-' in it. Do we need an IR name?
        this.language = titleCase(this.featuresConfig.language);
    }

    // TODO: How should we handle the custom badge for each language? We need access to the
    // GitHubOutputMode information. This is manually written in here for now.
    public async generateReadme({ output }: { output: fs.WriteStream }): Promise<void> {
        const blocks: Block[] = [];

        // Start with the header blocks.
        blocks.push(this.generateHeader());
        if (this.readmeConfig.requirements != null) {
            blocks.push(this.generateRequirements({ requirements: this.readmeConfig.requirements }));
        }
        if (this.readmeConfig.installation != null) {
            blocks.push(this.generateInstallation({ installation: this.readmeConfig.installation }));
        }

        // Then generate the feature blocks in the configured order.
        for (const feature of this.featuresConfig.features) {
            const endpoints = this.getEndpointsForFeature({ feature });
            blocks.push(
                this.generateFeatureBlock({
                    feature,
                    endpoints,
                }),
            );
        }

        const writer = new StreamWriter(output);
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
        const original = this.readmeParser.parse({ content: this.originalReadme });
        const merger = new BlockMerger({
            original,
            updated: blocks,
        });
        return merger.merge();
    }

    private writeBlocks({ writer, blocks }: { writer: Writer; blocks: Block[] }): void {
        for (const block of blocks) {
            block.write(writer);
        }
    }

    // TODO: This should index into the new Features type rather than using the old property.
    // We will otherwise just choose the standard snippets rather than the feature-specific ones.
    private getEndpointsForFeature({ feature }: { feature: FernGeneratorCli.Feature }): FernGeneratorExec.Endpoint[] {
        const readmeFeatureConfig = this.readmeConfig.features[feature.name];
        if (readmeFeatureConfig == null || readmeFeatureConfig.endpoints.length === 0) {
            // The user didn't choose a particular endpoint for this feature, so
            // we arbitrarily choose the first one.
            const endpoint = this.snippets.endpoints[0];
            if (endpoint == null) {
                return [];
            }
            return [endpoint];
        }
        // TODO: This is expensive - we should create a map.
        return this.snippets.endpoints.filter((endpoint) => {
            return readmeFeatureConfig.endpoints.some((readmeEndpoint) => {
                return matchEndpointIdentifier(endpoint.id, readmeEndpoint.id);
            });
        });
    }

    private generateFeatureBlock({
        feature,
        endpoints,
    }: {
        feature: FernGeneratorCli.Feature;
        endpoints: FernGeneratorExec.Endpoint[];
    }): Block {
        const writer = new StringWriter();
        writer.writeLine(`## ${feature.title != null ? feature.title : featureNameToTitle(feature.name)}`);
        if (feature.description != null) {
            writer.writeLine(feature.description);
        }
        for (const endpoint of endpoints) {
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
        }
        if (feature.addendum != null) {
            writer.writeLine(feature.addendum);
        }
        writer.writeLine();
        return new Block({
            id: feature.name,
            content: writer.toString(),
        });
    }

    // TODO: We should write the header separate from the rest since it's the only h1 component.
    private generateHeader(): Block {
        const writer = new StringWriter();
        writer.writeLine(`# ${this.organization} ${this.language} Library`);
        if (this.readmeConfig.bannerLink != null) {
            writer.writeLine(this.readmeConfig.bannerLink);
        }
        if (this.readmeConfig.publishInfo != null) {
            this.writeShield({
                writer,
                publishInfo: this.readmeConfig.publishInfo,
            });
        }
        writer.writeLine(
            `The ${this.organization} ${this.language} library provides convenient access to the ${this.organization} API from ${this.language}.`,
        );
        writer.writeLine();
        return new Block({
            id: "_",
            content: writer.toString(),
        });
    }

    private generateRequirements({ requirements }: { requirements: string }): Block {
        const writer = new StringWriter();
        writer.writeLine("## Requirements");
        writer.writeLine();
        writer.writeLine(requirements);
        return new Block({
            id: "requirements",
            content: writer.toString(),
        });
    }

    private generateInstallation({ installation }: { installation: string }): Block {
        const writer = new StringWriter();
        writer.writeLine("## Installation");
        writer.writeLine();
        writer.writeLine(installation);
        return new Block({
            id: "installation",
            content: writer.toString(),
        });
    }

    private writeShield({
        writer,
        publishInfo,
    }: {
        writer: Writer;
        publishInfo: FernGeneratorExec.GithubPublishInfo;
    }): void {
        // TODO: Handle the Go shield; we might want to add a GithubPublishInfo type.
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
            case "nuget":
            case "rubygems":
            case "postman":
                // TODO: Log a warning that we don't support this yet.
                return;
            default:
                assertNever(publishInfo);
        }
    }

    private writeShieldForNPM({ writer, npm }: { writer: Writer; npm: FernGeneratorExec.NpmGithubPublishInfo }): void {
        writer.write("![npm shield]");
        writer.write(`(https://img.shields.io/npm/v/${npm.packageName})]`);
        writer.writeLine(`(https://www.npmjs.com/package/${npm.packageName})`);
    }

    private writeShieldForPyPi({
        writer,
        pypi,
    }: {
        writer: Writer;
        pypi: FernGeneratorExec.PypiGithubPublishInfo;
    }): void {
        writer.write("![pypi]");
        writer.write(`(https://img.shields.io/pypi/v/${pypi.packageName})]`);
        writer.writeLine(`(https://pypi.python.org/pypi/${pypi.packageName})`);
    }

    private writeShieldForMaven({
        writer,
        maven,
    }: {
        writer: Writer;
        maven: FernGeneratorExec.MavenGithubPublishInfo;
    }): void {
        const { group, artifact } = splitMavenCoordinate(maven.coordinate);
        writer.write("![Maven Central]");
        writer.write(`(https://img.shields.io/maven-central/v/${artifact})]`);
        writer.writeLine(`(https://central.sonatype.com/artifact/${group}/${artifact})`);
    }

    private writeShieldForGo({
        writer,
        outputMode,
    }: {
        writer: Writer;
        outputMode: FernGeneratorExec.GithubOutputMode;
    }): void {
        const repositorySlug = trimPrefix(outputMode.repoUrl, "https://github.com/");
        writer.write("![go shield]");
        writer.write("(https://img.shields.io/badge/go-docs-blue)]");
        writer.writeLine(`(https://pkg.go.dev/github.com/${repositorySlug})`);
    }
}

function splitMavenCoordinate(mavenCoordinate: string): { group: string; artifact: string } {
    const separatorIndex = mavenCoordinate.indexOf(":");
    if (separatorIndex === -1) {
        throw new Error(`Malformed maven coordinate: ${mavenCoordinate}`);
    }
    return {
        group: mavenCoordinate.substring(0, separatorIndex),
        artifact: mavenCoordinate.substring(separatorIndex + 1),
    };
}

function featureNameToTitle(featureName: string): string {
    const title = FEATURE_TITLES[featureName];
    if (title != null) {
        return title;
    }
    return titleCase(featureName);
}

function titleCase(s: string): string {
    return s
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function trimPrefix(s: string, prefix: string): string {
    return s.startsWith(prefix) ? s.slice(prefix.length) : s;
}

function matchEndpointIdentifier(
    left: FernGeneratorExec.EndpointIdentifier,
    right: FernGeneratorExec.EndpointIdentifier,
): boolean {
    if (left.identifierOverride != null && right.identifierOverride != null) {
        return left.identifierOverride === right.identifierOverride;
    }
    return left.method === right.method && left.path === right.path;
}

// TODO: Import this from elsewhere.
function assertNever(x: never): never {
    throw new Error("Unexpected value: " + JSON.stringify(x));
}
