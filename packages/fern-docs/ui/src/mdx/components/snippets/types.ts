import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";

export declare namespace RequestSnippet {
  export interface Props {
    endpoint: string;
    example?: string;
  }
  export interface InternalProps {
    path: string;
    method: APIV1Read.HttpMethod;
    example: string | undefined;
  }
}

export declare namespace SchemaSnippet {
  export interface Props {
    endpoint: string;
    selector?: string;
  }

  export interface InternalProps {
    path: string;
    method: APIV1Read.HttpMethod;
    selector: string | undefined;
  }
}
