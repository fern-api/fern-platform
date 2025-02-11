import { ReactElement } from "react";

import { useAtom, useAtomValue, useSetAtom } from "jotai";

import type { EndpointContext } from "@fern-api/fdr-sdk/api-definition";
import {
  CopyToClipboardButton,
  FernButton,
  FernButtonGroup,
  FernCard,
} from "@fern-docs/components";

import { isFileForgeHackEnabledAtom } from "@/state/api-explorer-flags";

import {
  PLAYGROUND_AUTH_STATE_ATOM,
  PLAYGROUND_AUTH_STATE_OAUTH_ATOM,
  PLAYGROUND_REQUEST_TYPE_ATOM,
  store,
} from "../../atoms";
import { PlaygroundRequestPreview } from "../PlaygroundRequestPreview";
import { PlaygroundCodeSnippetResolverBuilder } from "../code-snippets/resolver";
import { PlaygroundEndpointRequestFormState } from "../types";
import { usePlaygroundBaseUrl } from "../utils/select-environment";

interface PlaygroundEndpointRequestCardProps {
  context: EndpointContext;
  formState: PlaygroundEndpointRequestFormState;
}

export function PlaygroundEndpointRequestCard({
  context,
  formState,
}: PlaygroundEndpointRequestCardProps): ReactElement<any> | null {
  const isFileForgeHackEnabled = useAtomValue(isFileForgeHackEnabledAtom);
  const [requestType, setRequestType] = useAtom(PLAYGROUND_REQUEST_TYPE_ATOM);
  const setOAuthValue = useSetAtom(PLAYGROUND_AUTH_STATE_OAUTH_ATOM);
  const [baseUrl] = usePlaygroundBaseUrl(context.endpoint);
  return (
    <FernCard className="flex min-w-0 flex-1 shrink flex-col overflow-hidden rounded-xl shadow-sm">
      <div className="border-default flex h-10 w-full shrink-0 items-center justify-between border-b px-3 py-2">
        <span className="t-muted text-xs uppercase">Request</span>
        <FernButtonGroup>
          <FernButton
            onClick={() => setRequestType("curl")}
            size="small"
            variant="minimal"
            intent={requestType === "curl" ? "primary" : "none"}
            active={requestType === "curl"}
          >
            cURL
          </FernButton>
          <FernButton
            onClick={() => setRequestType("typescript")}
            size="small"
            variant="minimal"
            intent={requestType === "typescript" ? "primary" : "none"}
            active={requestType === "typescript"}
          >
            TypeScript
          </FernButton>
          <FernButton
            onClick={() => setRequestType("python")}
            size="small"
            variant="minimal"
            intent={requestType === "python" ? "primary" : "none"}
            active={requestType === "python"}
          >
            Python
          </FernButton>
        </FernButtonGroup>
        <CopyToClipboardButton
          content={() => {
            const authState = store.get(PLAYGROUND_AUTH_STATE_ATOM);
            const resolver = new PlaygroundCodeSnippetResolverBuilder(
              context,
              true,
              isFileForgeHackEnabled
            ).create(authState, formState, baseUrl, setOAuthValue);
            return resolver.resolve(requestType);
          }}
          className="-mr-2"
        />
      </div>
      <PlaygroundRequestPreview
        context={context}
        formState={formState}
        requestType={requestType}
      />
    </FernCard>
  );
}
