"use client";

import { FC, useMemo } from "react";

import { useAtom, useAtomValue } from "jotai";

import type { EndpointContext } from "@fern-api/fdr-sdk/api-definition";
import { FernSyntaxHighlighter } from "@fern-docs/syntax-highlighter";

import { isFileForgeHackEnabledAtom } from "@/state/api-explorer-flags";

import {
  PLAYGROUND_AUTH_STATE_ATOM,
  PLAYGROUND_AUTH_STATE_OAUTH_ATOM,
} from "../atoms";
import { PlaygroundCodeSnippetResolverBuilder } from "./code-snippets/resolver";
import { useSnippet } from "./code-snippets/useSnippet";
import { PlaygroundEndpointRequestFormState } from "./types";
import { usePlaygroundBaseUrl } from "./utils/select-environment";

interface PlaygroundRequestPreviewProps {
  context: EndpointContext;
  formState: PlaygroundEndpointRequestFormState;
  requestType: "curl" | "typescript" | "python";
}

export const PlaygroundRequestPreview: FC<PlaygroundRequestPreviewProps> = ({
  context,
  formState,
  requestType,
}) => {
  const isFileForgeHackEnabled = useAtomValue(isFileForgeHackEnabledAtom);
  const authState = useAtomValue(PLAYGROUND_AUTH_STATE_ATOM);
  const [oAuthValue, setOAuthValue] = useAtom(PLAYGROUND_AUTH_STATE_OAUTH_ATOM);
  const [baseUrl] = usePlaygroundBaseUrl(context.endpoint);

  const builder = useMemo(
    () =>
      new PlaygroundCodeSnippetResolverBuilder(
        context,
        true,
        isFileForgeHackEnabled
      ),
    [context, isFileForgeHackEnabled]
  );

  const resolver = useMemo(
    () =>
      oAuthValue &&
      builder.createRedacted(authState, formState, baseUrl, setOAuthValue),
    [authState, builder, formState, oAuthValue, baseUrl, setOAuthValue]
  );
  const code = useSnippet(resolver, requestType);

  return (
    <FernSyntaxHighlighter
      className={"relative min-h-0 flex-1 shrink"}
      language={requestType === "curl" ? "bash" : requestType}
      code={code}
      fontSize="sm"
      id={context.endpoint.id}
    />
  );
};
