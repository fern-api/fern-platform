/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as FernRegistry from "../../../../../../../../../index";
export declare type SizeConfig = FernRegistry.docs.v1.commons.SizeConfig.Px | FernRegistry.docs.v1.commons.SizeConfig.Rem;
export declare namespace SizeConfig {
    interface Px {
        type: "px";
        value: number;
    }
    interface Rem {
        type: "rem";
        value: number;
    }
}
