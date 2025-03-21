/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as FernRegistry from "../../../../../index";

export interface WithNodeMetadata
    extends FernRegistry.navigation.v1.WithNodeId,
        FernRegistry.navigation.v1.WithPermissions,
        FernRegistry.navigation.latest.WithFeatureFlags {
    title: string;
    slug: FernRegistry.navigation.v1.Slug;
    icon: string | undefined;
    hidden: boolean | undefined;
    authed: boolean | undefined;
}
