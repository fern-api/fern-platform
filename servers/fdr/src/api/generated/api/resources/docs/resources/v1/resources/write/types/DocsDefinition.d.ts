/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as FernRegistry from "../../../../../../../index";
export interface DocsDefinition {
    pages: Record<FernRegistry.PageId, FernRegistry.docs.v1.write.PageContent>;
    config: FernRegistry.docs.v1.write.DocsConfig;
    /**
     * A map of file names to their contents.
     * The key is the absolute path file name and the value is the file contents.
     */
    jsFiles: Record<string, string> | undefined;
}
