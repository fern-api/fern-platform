/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as FernRegistry from "../../../index";
export interface ApiDiff {
    addedEndpoints: FernRegistry.AddedEndpoint[];
    removedEndpoints: FernRegistry.RemovedEndpoint[];
    updatedEndpoints: FernRegistry.UpdatedEndpoint[];
    markdown: string;
}
