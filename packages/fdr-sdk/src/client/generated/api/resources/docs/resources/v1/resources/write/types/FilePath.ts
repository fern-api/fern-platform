/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as FernRegistry from "../../../../../../../index";

/**
 * Each string is a unique key for the file. You can use the filepath as a key.
 */
export type FilePath = string & {
    docs_v1_write_FilePath: void;
};

export function FilePath(value: string): FernRegistry.docs.v1.write.FilePath {
    return value as unknown as FernRegistry.docs.v1.write.FilePath;
}
