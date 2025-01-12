import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { FC, ReactElement } from "react";
import { ExplorerBasicAuthForm } from "./ExplorerBasicAuthForm";
import { ExplorerBearerAuthForm } from "./ExplorerBearerAuthForm";
import { ExplorerHeaderAuthForm } from "./ExplorerHeaderAuthForm";
import { ExplorerOAuthForm } from "./ExplorerOAuthForm";

interface ExplorerAuthorizationFormProps {
  auth: APIV1Read.ApiAuth;
  closeContainer: () => void;
  disabled: boolean;
}

export const ExplorerAuthorizationForm: FC<ExplorerAuthorizationFormProps> = ({
  auth,
  closeContainer,
  disabled,
}) => {
  return (
    <ul className="list-none px-4">
      {visitDiscriminatedUnion(auth, "type")._visit<ReactElement | false>({
        bearerAuth: (bearerAuth) => (
          <ExplorerBearerAuthForm bearerAuth={bearerAuth} disabled={disabled} />
        ),
        basicAuth: (basicAuth) => (
          <ExplorerBasicAuthForm basicAuth={basicAuth} disabled={disabled} />
        ),
        header: (header) => (
          <ExplorerHeaderAuthForm header={header} disabled={disabled} />
        ),
        oAuth: (oAuth) => (
          <ExplorerOAuthForm
            oAuth={oAuth}
            closeContainer={closeContainer}
            disabled={disabled}
          />
        ),
        _other: () => false,
      })}
    </ul>
  );
};
