/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as FernRegistry from "../../../../../../../index";
export interface StartDocsRegisterResponse {
    docsRegistrationId: FernRegistry.docs.v1.write.DocsRegistrationId;
    uploadUrls: Record<FernRegistry.docs.v1.write.FilePath, FernRegistry.docs.v1.write.FileS3UploadUrl>;
}
