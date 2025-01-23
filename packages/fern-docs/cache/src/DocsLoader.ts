import type { DocsV1Read, FernNavigation } from "@fern-api/fdr-sdk";
import type { ApiDefinition } from "@fern-api/fdr-sdk/api-definition";
import type { ApiDefinitionLoader } from "./ApiDefinitionLoader";

export interface DocsLoader {
  domain: string;

  /**
   * @returns true if the docs site requires authentication
   */
  isAuthed(): Promise<boolean>;
  /**
   * @returns the root node of the navigation tree
   */
  root(): Promise<FernNavigation.RootNode | undefined>;
  /**
   * @returns the unpruned root node of the navigation tree (including all hidden pages and authed pages)
   */
  unprunedRoot(): Promise<FernNavigation.RootNode | undefined>;
  /**
   * @returns the markdown content for the given page id
   */
  getPage(
    pageId: FernNavigation.PageId
  ): Promise<{ markdown: string; sourceUrl: string | undefined } | undefined>;
  /**
   * @returns all pages
   */
  getAllPages(): Promise<
    Record<
      FernNavigation.PageId,
      { markdown: string; sourceUrl: string | undefined }
    >
  >;
  /**
   * @returns all api definitions in a record
   */
  loadAllApis(): Promise<Record<FernNavigation.ApiDefinitionId, ApiDefinition>>;
  /**
   * @returns the metadata for the given file
   */
  getFile(fileId: FernNavigation.FileId): Promise<DocsV1Read.File_ | undefined>;
  /**
   * @returns the api definition loader for the given key
   */
  getApiDefinitionLoader(
    key: FernNavigation.ApiDefinitionId
  ): Promise<ApiDefinitionLoader | undefined>;
  /**
   * @returns the metadata for the given domain
   */
  getMetadata(): Promise<{ orgId: string; isPreviewUrl: boolean } | undefined>;
  /**
   * @returns the docs config
   */
  getDocsConfig(): Promise<DocsV1Read.DocsConfig | undefined>;
}
