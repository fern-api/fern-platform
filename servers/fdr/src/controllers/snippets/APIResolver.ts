import { FdrAPI } from "@fern-api/fdr-sdk";

import {
  ApiIdRequiredError,
  OrgIdAndApiIdNotFound,
} from "../../api/generated/api/resources/snippets/errors";
import { FdrApplication } from "../../app";
import { AuthUtility } from "./AuthUtils";

export interface ResolvedAPI {
  apiId: FdrAPI.ApiId;
  orgId: FdrAPI.OrgId;
}

export class APIResolver {
  private authUtil: AuthUtility;
  constructor(
    private readonly app: FdrApplication,
    authHeader: string
  ) {
    this.authUtil = new AuthUtility(app, authHeader);
  }

  public async resolve(): Promise<ResolvedAPI> {
    const orgId = await this.authUtil.inferOrg();
    return this.resolveWithOrgId({ orgId });
  }

  public async resolveWithApiId({
    apiId,
  }: {
    apiId: FdrAPI.ApiId;
  }): Promise<ResolvedAPI> {
    const orgId = await this.authUtil.inferOrg();
    return this.resolveWithOrgAndApiId({ orgId, apiId });
  }

  public async resolveWithOrgId({
    orgId,
  }: {
    orgId: FdrAPI.OrgId;
  }): Promise<ResolvedAPI> {
    const apiInfos = await this.app.dao.snippetAPIs().loadSnippetAPIs({
      loadSnippetAPIsRequest: {
        orgIds: [orgId],
        apiName: undefined,
      },
    });
    if (apiInfos.length > 1) {
      throw new ApiIdRequiredError(
        "Multiple APIs were found; please provide an apiId"
      );
    }
    const inferredApi = Array.from(apiInfos)[0];
    if (inferredApi == null) {
      throw new ApiIdRequiredError(
        "No APIs were found; have you triggered SDK generation and publishing?"
      );
    }
    return this.resolveWithOrgAndApiId({
      orgId,
      apiId: FdrAPI.ApiId(inferredApi.apiName),
    });
  }

  public async resolveWithOrgAndApiId({
    orgId,
    apiId,
  }: {
    orgId: FdrAPI.OrgId;
    apiId: FdrAPI.ApiId;
  }): Promise<ResolvedAPI> {
    await this.authUtil.assertUserHasAccessToOrg(orgId);
    const snippetAPI = await this.app.dao.snippetAPIs().loadSnippetAPI({
      loadSnippetAPIRequest: {
        orgId,
        apiName: apiId,
      },
    });
    if (snippetAPI === null) {
      throw new OrgIdAndApiIdNotFound(
        `Organization ${orgId} does not have API ${apiId}`
      );
    }
    return {
      orgId: FdrAPI.OrgId(snippetAPI.orgId),
      apiId: FdrAPI.ApiId(snippetAPI.apiName),
    };
  }

  public async resolveApi({
    orgId,
    apiId,
  }: {
    orgId: FdrAPI.OrgId | undefined;
    apiId: FdrAPI.ApiId | undefined;
  }): Promise<ResolvedAPI> {
    if (orgId != null && apiId != null) {
      return await this.resolveWithOrgAndApiId({ orgId, apiId });
    } else if (orgId != null && apiId == null) {
      return await this.resolveWithOrgId({ orgId });
    } else if (orgId == null && apiId != null) {
      return await this.resolveWithApiId({ apiId });
    } else {
      return await this.resolve();
    }
  }
}
