/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index";
import * as FernGeneratorCli from "../../../../api/index";
import * as core from "../../../../core";
import { MavenPublishInfo } from "./MavenPublishInfo";

export const JavaInfo: core.serialization.ObjectSchema<serializers.JavaInfo.Raw, FernGeneratorCli.JavaInfo> =
    core.serialization.object({
        publishInfo: MavenPublishInfo.optional(),
    });

export declare namespace JavaInfo {
    interface Raw {
        publishInfo?: MavenPublishInfo.Raw | null;
    }
}
