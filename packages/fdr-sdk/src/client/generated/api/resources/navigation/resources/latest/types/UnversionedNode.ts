/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as FernRegistry from "../../../../../index";

export interface UnversionedNode extends FernRegistry.navigation.latest.WithNodeId {
    type: "unversioned";
    child: FernRegistry.navigation.latest.VersionChild;
    landingPage: FernRegistry.navigation.latest.LandingPageNode | undefined;
}