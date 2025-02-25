/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as FernRegistry from "../../../index";

export type SingleAlgoliaIndexInfo =
    | FernRegistry.SingleAlgoliaIndexInfo.Unversioned
    | FernRegistry.SingleAlgoliaIndexInfo.Versioned;

export declare namespace SingleAlgoliaIndexInfo {
    interface Unversioned extends FernRegistry.UnversionedSingleAlgoliaIndexInfo {
        type: "unversioned";
    }

    interface Versioned extends FernRegistry.VersionedSingleAlgoliaIndexInfo {
        type: "versioned";
    }
}
