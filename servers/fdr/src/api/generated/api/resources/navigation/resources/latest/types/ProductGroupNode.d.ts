/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as FernRegistry from "../../../../../index";
export interface ProductGroupNode extends FernRegistry.navigation.latest.WithNodeId {
    type: "productgroup";
    landingPage: FernRegistry.navigation.latest.LandingPageNode | undefined;
    /** The individual products being documented */
    children: FernRegistry.navigation.latest.ProductNode[];
}