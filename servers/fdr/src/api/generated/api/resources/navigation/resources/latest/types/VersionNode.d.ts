/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as FernRegistry from "../../../../../index";
export interface VersionNode extends FernRegistry.navigation.latest.WithNodeMetadata, FernRegistry.navigation.latest.WithRedirect {
    type: "version";
    default: boolean;
    versionId: FernRegistry.VersionId;
    child: FernRegistry.navigation.latest.VersionChild;
    availability: FernRegistry.Availability | undefined;
    landingPage: FernRegistry.navigation.latest.LandingPageNode | undefined;
}
