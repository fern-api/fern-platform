import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { FC, ReactElement } from "react";
import { PlaygroundBasicAuthForm } from "./PlaygroundBasicAuthForm";
import { PlaygroundBearerAuthForm } from "./PlaygroundBearerAuthForm";
import { PlaygroundHeaderAuthForm } from "./PlaygroundHeaderAuthForm";
import { PlaygroundOAuthForm } from "./PlaygroundOAuthForm";

interface PlaygroundAuthorizationFormProps {
    auth: APIV1Read.ApiAuth;
    closeContainer: () => void;
    disabled: boolean;
}

export const PlaygroundAuthorizationForm: FC<
    PlaygroundAuthorizationFormProps
> = ({ auth, closeContainer, disabled }) => {
    return (
        <ul className="list-none px-4">
            {visitDiscriminatedUnion(auth, "type")._visit<ReactElement | false>(
                {
                    bearerAuth: (bearerAuth) => (
                        <PlaygroundBearerAuthForm
                            bearerAuth={bearerAuth}
                            disabled={disabled}
                        />
                    ),
                    basicAuth: (basicAuth) => (
                        <PlaygroundBasicAuthForm
                            basicAuth={basicAuth}
                            disabled={disabled}
                        />
                    ),
                    header: (header) => (
                        <PlaygroundHeaderAuthForm
                            header={header}
                            disabled={disabled}
                        />
                    ),
                    oAuth: (oAuth) => (
                        <PlaygroundOAuthForm
                            oAuth={oAuth}
                            closeContainer={closeContainer}
                            disabled={disabled}
                        />
                    ),
                    _other: () => false,
                }
            )}
        </ul>
    );
};
