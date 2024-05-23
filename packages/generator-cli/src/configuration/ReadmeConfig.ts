// TODO: This type is written by hand for now, but it will eventually need to
// be encoded as a Fern definition and included in the generator-cli definition.

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

export interface ReadmeConfig {
    bannerLink: string | undefined;
    docsLink: string | undefined;
    installation: string | undefined;
    requirements: string | undefined;
    features: ReadmeFeature[];
}

export interface ReadmeFeature {
    name: string;
    endpoints: ReadmeEndpoint[];
}

export interface ReadmeEndpoint {
    id: FernGeneratorExec.EndpointIdentifier;
}
