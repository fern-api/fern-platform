"use client";

import {
  EndpointDefinition,
  WebSocketChannel,
} from "@fern-api/fdr-sdk/api-definition";

import { usePlaygroundBaseUrl } from "../../playground/utils/select-environment";
import { EndpointUrlWithOverflow } from "./EndpointUrlWithOverflow";

export const EndpointUrlWithPlaygroundBaseUrl = ({
  endpoint,
}: {
  endpoint: WebSocketChannel | EndpointDefinition;
}) => {
  const [baseUrl, environmentId] = usePlaygroundBaseUrl(endpoint);
  return (
    <EndpointUrlWithOverflow
      baseUrl={baseUrl}
      environmentId={environmentId}
      path={endpoint.path}
      method={"method" in endpoint ? endpoint.method : "GET"}
      options={endpoint.environments}
      showEnvironment
      large
    />
  );
};
