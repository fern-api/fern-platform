import { ApiDefinition } from "@fern-api/fdr-sdk";
import { measureBytes, truncateToBytes } from "@fern-api/ui-core-utils";

import { maybePrepareMdxContent } from "../../utils/prepare-mdx-content";
import { toDescription } from "../../utils/to-description";
import { ApiReferenceRecord, EndpointBaseRecord } from "../types";

interface CreateApiReferenceRecordHttpOptions {
  endpointBase: EndpointBaseRecord;
  endpoint: ApiDefinition.EndpointDefinition;
}

export function createApiReferenceRecordHttp({
  endpointBase,
  endpoint,
}: CreateApiReferenceRecordHttpOptions): ApiReferenceRecord[] {
  const base: ApiReferenceRecord = {
    ...endpointBase,
    type: "api-reference",
  };

  const records: ApiReferenceRecord[] = [base];
  const {
    content: request_description,
    code_snippets: request_description_code_snippets,
  } = maybePrepareMdxContent(
    toDescription(endpoint.requests?.[0]?.description)
  );

  if (
    request_description != null ||
    request_description_code_snippets?.length
  ) {
    records.push({
      ...base,
      objectID: `${base.objectID}-request`,
      hash: "#request",
      breadcrumb: [
        ...(base.breadcrumb ?? []),
        { title: base.title, pathname: base.pathname },
      ],
      title: `${base.title} - Request`,
      // TODO: chunk this
      description:
        request_description != null
          ? truncateToBytes(request_description, 50 * 1000)
          : undefined,
      code_snippets: request_description_code_snippets?.filter(
        (codeSnippet) => measureBytes(codeSnippet.code) < 2000
      ),
      page_position: 1,
    });
  }

  const {
    content: response_description,
    code_snippets: response_description_code_snippets,
  } = maybePrepareMdxContent(
    toDescription(endpoint.responses?.[0]?.description)
  );

  if (
    response_description != null ||
    response_description_code_snippets?.length
  ) {
    records.push({
      ...base,
      objectID: `${base.objectID}-response`,
      hash: "#response",
      breadcrumb: [
        ...(base.breadcrumb ?? []),
        { title: base.title, pathname: base.pathname },
      ],
      title: `${base.title} - Response`,
      // TODO: chunk this
      description:
        response_description != null
          ? truncateToBytes(response_description, 50 * 1000)
          : undefined,
      code_snippets: response_description_code_snippets?.filter(
        (codeSnippet) => measureBytes(codeSnippet.code) < 2000
      ),
      page_position: 1,
    });
  }

  return records;
}
