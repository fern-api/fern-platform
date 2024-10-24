/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as FernRegistry from "../../../../../../../../../index";

export interface ErrorDeclarationV2 extends FernRegistry.api.v1.WithDescription, FernRegistry.api.v1.WithAvailability {
    type: FernRegistry.api.v1.read.TypeShape | undefined;
    statusCode: number;
    name: string | undefined;
    examples: FernRegistry.api.v1.read.ErrorExample[] | undefined;
}
