import { usePathname } from "next/navigation";
import { FC, Fragment, ReactNode } from "react";

import { omitBy } from "es-toolkit/object";
import { isUndefined } from "es-toolkit/predicate";
import { X } from "lucide-react";

import type {
  Environment,
  EnvironmentId,
  HttpMethod,
  ObjectProperty,
  PathPart,
  TypeDefinition,
  TypeId,
} from "@fern-api/fdr-sdk/api-definition";
import {
  buildRequestUrl,
  unwrapReference,
} from "@fern-api/fdr-sdk/api-definition";
import unknownToString from "@fern-api/ui-core-utils/unknownToString";
import visitDiscriminatedUnion from "@fern-api/ui-core-utils/visitDiscriminatedUnion";
import { cn } from "@fern-docs/components";
import { CopyToClipboardButton } from "@fern-docs/components";
import { HttpMethodBadge } from "@fern-docs/components/badges";
import { useBooleanState } from "@fern-ui/react-commons";

import { FernLinkButton } from "@/components/components/FernLinkButton";
import { useAllEnvironmentIds } from "@/state/environment";

import { MaybeEnvironmentDropdown } from "../../components/MaybeEnvironmentDropdown";
import { PlaygroundSendRequestButton } from "../PlaygroundSendRequestButton";
import { PlaygroundRequestFormState } from "../types";

interface PlaygroundEndpointPathProps {
  method: HttpMethod | undefined;
  environmentId: EnvironmentId | undefined;
  baseUrl: string | undefined;
  options: Environment[] | undefined;
  formState: PlaygroundRequestFormState;
  path: PathPart[];
  queryParameters: ObjectProperty[] | undefined;
  sendRequest: () => void;
  sendRequestButtonLabel?: string;
  sendRequestIcon?: ReactNode;
  types: Record<TypeId, TypeDefinition>;
}

export const PlaygroundEndpointPath: FC<PlaygroundEndpointPathProps> = ({
  environmentId,
  baseUrl,
  options,
  method,
  formState,
  path,
  queryParameters,
  sendRequest,
  sendRequestButtonLabel,
  sendRequestIcon,
  types,
}) => {
  const environmentIds = useAllEnvironmentIds();
  const isEditingEnvironment = useBooleanState(false);

  return (
    <div className="playground-endpoint">
      <div className="bg-(color:--grayscale-a3) rounded-2 flex h-10 min-w-0 flex-1 shrink items-center gap-2 px-4 py-2 max-sm:h-8 max-sm:px-2 max-sm:py-1 sm:rounded-[20px]">
        {method != null && (
          <HttpMethodBadge
            method={method}
            className="playground-endpoint-method"
          />
        )}
        <span
          className={cn(
            environmentIds.length > 1
              ? "playground-endpoint-url-with-switcher"
              : "playground-endpoint-url",
            "flex w-full flex-row",
            "items-baseline"
          )}
        >
          <span className="playground-endpoint-baseurl max-sm:hidden">
            <MaybeEnvironmentDropdown
              environmentId={environmentId}
              baseUrl={baseUrl}
              options={options}
              small
              urlTextStyle="playground-endpoint-baseurl max-sm:hidden"
              protocolTextStyle="playground-endpoint-baseurl max-sm:hidden"
              editable
              isEditingEnvironment={isEditingEnvironment}
            />
          </span>
          {path.map((part, idx) => {
            return visitDiscriminatedUnion(part, "type")._visit({
              literal: (literal) => <span key={idx}>{literal.value}</span>,
              pathParameter: (pathParameter) => {
                const stateValue = unknownToString(
                  formState.pathParameters[pathParameter.value]
                );
                return (
                  <span
                    key={idx}
                    className={cn({
                      "text-(color:--accent-a11) bg-(color:--accent-a3) rounded-1 px-1 before:content-[':']":
                        stateValue.length === 0,
                      "text-(color:--accent-a11) font-semibold":
                        stateValue.length > 0,
                    })}
                  >
                    {stateValue.length > 0
                      ? encodeURI(stateValue)
                      : pathParameter.value}
                  </span>
                );
              },
              _other: () => null,
            });
          })}
          {queryParameters &&
            queryParameters.length > 0 &&
            Object.keys(omitBy(formState.queryParameters, isUndefined)).length >
              0 &&
            queryParameters
              .filter((queryParameter) => {
                const stateValue =
                  formState.queryParameters[queryParameter.key];
                const unwrapped = unwrapReference(
                  queryParameter.valueShape,
                  types
                );
                if (stateValue == null && unwrapped.isOptional) {
                  return false;
                }
                return true;
              })
              .map((queryParameter, idx) => {
                const stateValue = unknownToString(
                  formState.queryParameters[queryParameter.key]
                );
                return (
                  <Fragment key={idx}>
                    <span>{idx === 0 ? "?" : "&"}</span>

                    <span>{queryParameter.key}</span>
                    <span>{"="}</span>
                    <span className={"text-(color:--accent-a11) font-semibold"}>
                      {encodeURI(stateValue)}
                    </span>
                  </Fragment>
                );
              })}
        </span>
        <CopyToClipboardButton
          className="playground-endpoint-copy-button"
          content={() =>
            buildRequestUrl({
              path,
              pathParameters: formState.pathParameters,
              queryParameters: formState.queryParameters,
              baseUrl,
            })
          }
        />
      </div>

      <div className="max-sm:hidden">
        <PlaygroundSendRequestButton
          sendRequest={sendRequest}
          sendRequestButtonLabel={sendRequestButtonLabel}
          sendRequestIcon={sendRequestIcon}
        />
      </div>

      <CloseButton />
    </div>
  );
};

function CloseButton() {
  const pathname = usePathname();
  return (
    <FernLinkButton
      icon={<X />}
      size="large"
      rounded
      variant="outlined"
      href={pathname.replace("/~explorer", "")}
      replace
      scroll={false}
    />
  );
}
