/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as FernGeneratorCli from "../../../../api/index";
import * as core from "../../../../core";
import { NpmPublishInfo } from "./NpmPublishInfo";

export const TypescriptInfo: core.serialization.ObjectSchema<
    serializers.TypescriptInfo.Raw,
    FernGeneratorCli.TypescriptInfo
> = core.serialization.object({
    publishInfo: NpmPublishInfo.optional(),
});

export declare namespace TypescriptInfo {
    interface Raw {
        publishInfo?: NpmPublishInfo.Raw | null;
    }
}
