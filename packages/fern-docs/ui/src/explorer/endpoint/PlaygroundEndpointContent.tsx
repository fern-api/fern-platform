import type { EndpointContext } from "@fern-api/fdr-sdk/api-definition";
import { Loadable } from "@fern-ui/loadable";
import {
  Dispatch,
  ReactElement,
  SetStateAction,
  useDeferredValue,
} from "react";
import { ExplorerAuthorizationFormCard } from "../auth";
import { ExplorerEndpointRequestFormState } from "../types";
import { ExplorerResponse } from "../types/explorerResponse";
import { shouldRenderAuth } from "../utils/should-render-auth";
import { ExplorerEndpointContentLayout } from "./ExplorerEndpointContentLayout";
import { ExplorerEndpointForm } from "./ExplorerEndpointForm";
import { ExplorerEndpointFormButtons } from "./ExplorerEndpointFormButtons";
import { ExplorerEndpointRequestCard } from "./ExplorerEndpointRequestCard";
import { ExplorerResponseCard } from "./ExplorerResponseCard";

interface ExplorerEndpointContentProps {
  context: EndpointContext;
  formState: ExplorerEndpointRequestFormState;
  setFormState: Dispatch<SetStateAction<ExplorerEndpointRequestFormState>>;
  resetWithExample: () => void;
  resetWithoutExample: () => void;
  response: Loadable<ExplorerResponse>;
  sendRequest: () => void;
}

export function ExplorerEndpointContent({
  context,
  formState,
  setFormState,
  resetWithExample,
  resetWithoutExample,
  response,
  sendRequest,
}: ExplorerEndpointContentProps): ReactElement {
  const deferredFormState = useDeferredValue(formState);

  const form = (
    <div className="mx-auto w-full max-w-5xl space-y-6 pt-6 max-sm:pt-0 sm:pb-20">
      {context.auth != null &&
        shouldRenderAuth(context.endpoint, context.auth) && (
          <ExplorerAuthorizationFormCard auth={context.auth} disabled={false} />
        )}

      <div className="col-span-2 space-y-8">
        <ExplorerEndpointForm
          context={context}
          formState={formState}
          setFormState={setFormState}
        />
      </div>

      <ExplorerEndpointFormButtons
        node={context.node}
        resetWithExample={resetWithExample}
        resetWithoutExample={resetWithoutExample}
      />
    </div>
  );

  const requestCard = (
    <ExplorerEndpointRequestCard
      context={context}
      formState={deferredFormState}
    />
  );
  const responseCard = (
    <ExplorerResponseCard response={response} sendRequest={sendRequest} />
  );

  return (
    <ExplorerEndpointContentLayout
      endpointId={context.endpoint.id}
      sendRequest={sendRequest}
      form={form}
      requestCard={requestCard}
      responseCard={responseCard}
    />
  );
}
