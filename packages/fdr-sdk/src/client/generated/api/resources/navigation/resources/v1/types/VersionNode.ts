/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as FernRegistry from "../../../../../index";

export interface VersionNode
    extends FernRegistry.navigation.v1.WithNodeMetadata,
        FernRegistry.navigation.v1.WithRedirect {
    type: "version";
    default: boolean;
    versionId: FernRegistry.VersionId;
    child: FernRegistry.navigation.v1.VersionChild;
    availability: FernRegistry.navigation.v1.NavigationV1Availability | undefined;
    landingPage: FernRegistry.navigation.v1.LandingPageNode | undefined;
}
