/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as FernRegistry from "../../../../../../../index";

export interface FormDataFiles
    extends FernRegistry.api.latest.WithDescription,
        FernRegistry.api.latest.WithAvailability {
    key: FernRegistry.PropertyKey;
    isOptional: boolean;
    contentType: FernRegistry.api.latest.ContentType | undefined;
}
