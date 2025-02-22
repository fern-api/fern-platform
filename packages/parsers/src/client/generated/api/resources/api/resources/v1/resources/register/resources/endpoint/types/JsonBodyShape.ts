/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as FernRegistry from "../../../../../../../../../index";

export type JsonBodyShape =
    | FernRegistry.api.v1.register.JsonBodyShape.Object_
    | FernRegistry.api.v1.register.JsonBodyShape.Reference;

export declare namespace JsonBodyShape {
    interface Object_ extends FernRegistry.api.v1.register.ObjectType {
        type: "object";
    }

    interface Reference {
        type: "reference";
        value: FernRegistry.api.v1.register.TypeReference;
    }
}
