import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { useMemo } from "react";
import { WithAside } from "../../contexts/api-page";
import { WebhookContent } from "./WebhookContent";
import { WebhookContextProvider } from "./webhook-context/WebhookContextProvider";

export declare namespace Webhook {
  export interface Props {
    node: FernNavigation.WebhookNode;
    apiDefinition: ApiDefinition.ApiDefinition;
    breadcrumb: readonly FernNavigation.BreadcrumbItem[];
    last?: boolean;
  }
}

export const Webhook: React.FC<Webhook.Props> = ({
  node,
  apiDefinition,
  breadcrumb,
  last,
}) => {
  const context = useMemo(
    () => ApiDefinition.createWebhookContext(node, apiDefinition),
    [node, apiDefinition]
  );

  if (!context) {
    console.error("Could not create context for webhook", node);
    return null;
  }

  return (
    <WithAside.Provider value={true}>
      <WebhookContextProvider>
        <WebhookContent breadcrumb={breadcrumb} context={context} last={last} />
      </WebhookContextProvider>
    </WithAside.Provider>
  );
};
