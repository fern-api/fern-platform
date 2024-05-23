// TODO: This type is written by hand for now, but it will eventually need to
// be encoded as a Fern definition and included in the generator-cli definition.

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

export interface ReadmeConfig {
    organization: string;
    publishInfo: FernGeneratorExec.GithubPublishInfo | undefined;
    bannerLink: string | undefined;
    docsLink: string | undefined;
    installation: string | undefined;

    // TODO: The 'requirements' section is also based on the particular generator invocation.
    requirements: string | undefined;

    // Used to select which endpoints to use in a particular feature block.
    features: Record<string, ReadmeFeature>;

    // TODO: We can easily extend this to support an ordered layout.
    layout: ReadmeFeature[];
}

export interface ReadmeFeature {
    name: string;
    endpoints: ReadmeEndpoint[];
}

export interface ReadmeEndpoint {
    id: FernGeneratorExec.EndpointIdentifier;
}
