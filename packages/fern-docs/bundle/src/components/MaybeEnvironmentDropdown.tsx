import React, { ReactElement, useEffect, useState } from "react";

import { useAtom } from "jotai";
import { parse } from "url";

import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { cn } from "@fern-docs/components";
import { FernButton, FernDropdown, FernInput } from "@fern-docs/components";
import { useBooleanState } from "@fern-ui/react-commons";

import { SELECTED_ENVIRONMENT_ATOM } from "@/state/environment";
import { PLAYGROUND_ENVIRONMENT_ATOM } from "@/state/playground";

interface MaybeEnvironmentDropdownProps {
  baseUrl?: string;
  environmentId: APIV1Read.EnvironmentId | undefined;
  urlTextStyle?: string;
  protocolTextStyle?: string;
  small?: boolean;
  // environmentFilters?: APIV1Read.EnvironmentId[];
  options?: APIV1Read.Environment[];
  editable?: boolean;
  isEditingEnvironment: useBooleanState.Return;
}

export function MaybeEnvironmentDropdown({
  baseUrl,
  environmentId,
  urlTextStyle,
  protocolTextStyle,
  small,
  options,
  editable,
  isEditingEnvironment,
}: MaybeEnvironmentDropdownProps): ReactElement<any> | null {
  // const [allEnvironmentIds] = useAtom(ALL_ENVIRONMENTS_ATOM);
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useAtom(
    SELECTED_ENVIRONMENT_ATOM
  );
  const [playgroundEnvironment, setPlaygroundEnvironment] = useAtom(
    PLAYGROUND_ENVIRONMENT_ATOM
  );
  const [inputValue, setInputValue] = useState<string | undefined>(undefined);
  const [initialState, setInitialState] = useState<string | undefined>(
    undefined
  );

  const selectedEnvironment =
    options?.find((option) => option.id === selectedEnvironmentId) ??
    options?.[0];

  // const environmentIds = environmentFilters
  //     ? environmentFilters.filter((environmentFilter) => allEnvironmentIds.includes(environmentFilter))
  //     : allEnvironmentIds;

  // useEffect(() => {
  //     if (environmentFilters && environmentId && !environmentFilters.includes(environmentId)) {
  //         setSelectedEnvironmentId(environmentId);
  //     }
  // }, [environmentFilters, environmentId, setSelectedEnvironmentId]);

  // TODO: revisit the order of precedence for the baseUrl... this is a temporary fix
  const preParsedUrl =
    playgroundEnvironment ?? selectedEnvironment?.baseUrl ?? baseUrl;
  const url = preParsedUrl && parse(preParsedUrl);

  // TODO: clean up this component
  useEffect(() => {
    if (
      !!url &&
      url.host &&
      url.host !== "" &&
      url.protocol &&
      url.protocol !== ""
    ) {
      setInputValue(preParsedUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playgroundEnvironment]);

  const isValidInput =
    inputValue != null &&
    inputValue !== "" &&
    parse(inputValue).host != null &&
    parse(inputValue).protocol != null;

  const urlProtocol = url ? url.protocol : "";
  const fullyQualifiedDomainAndBasePath = url
    ? url.pathname != null && url.pathname !== "/"
      ? `${url.host}${url.pathname}`
      : url.host
    : "";

  return (
    <>
      {isEditingEnvironment.value ? (
        <span
          key="url"
          className="inline-flex whitespace-nowrap font-mono max-sm:hidden"
        >
          <FernInput
            autoFocus={isEditingEnvironment.value}
            size={inputValue?.length ?? 0}
            placeholder={inputValue}
            value={inputValue}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onBlur={(e) => {
              if (isValidInput) {
                if (playgroundEnvironment) {
                  setInputValue(playgroundEnvironment);
                }
                isEditingEnvironment.setFalse();
              } else {
                e.preventDefault();
                e.stopPropagation();
                setInputValue(initialState);
                setPlaygroundEnvironment(initialState);
                isEditingEnvironment.setFalse();
              }
            }}
            onValueChange={(value) => {
              if (
                value === "" ||
                value == null ||
                parse(value).host == null ||
                parse(value).protocol == null
              ) {
                setInputValue(value);
              } else {
                setInputValue(value);
                setPlaygroundEnvironment(value);
              }
            }}
            onKeyDownCapture={(e) => {
              if (e.key === "Enter" && isValidInput) {
                if (playgroundEnvironment) {
                  setInputValue(playgroundEnvironment);
                }
                isEditingEnvironment.setFalse();
              } else if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                setInputValue(initialState);
                setPlaygroundEnvironment(initialState);
                isEditingEnvironment.setFalse();
              }
            }}
            className={cn(
              "p-0",
              isValidInput ? "" : "error",
              "h-auto",
              "flex flex-col"
            )}
            inputClassName={cn(
              "px-1",
              "py-0.5",
              "h-auto",
              "font-mono",
              small ? "text-xs" : "text-sm"
            )}
          />
        </span>
      ) : (
        <>
          <span className="max-sm:hidden">
            {options && options.length > 1 ? (
              <FernDropdown
                key="selectedEnvironment-selector"
                options={options.map((env) => ({
                  value: env.id,
                  label: env.id,
                  type: "value",
                }))}
                onValueChange={(value) => {
                  setPlaygroundEnvironment(undefined);
                  setSelectedEnvironmentId(value);
                }}
                value={selectedEnvironment?.id ?? environmentId}
              >
                <FernButton
                  className="h-auto px-1 py-0"
                  text={
                    <span
                      key="protocol"
                      className="whitespace-nowrap max-sm:hidden"
                    >
                      <span
                        className={protocolTextStyle}
                      >{`${urlProtocol}//`}</span>
                      <span className={urlTextStyle}>
                        {fullyQualifiedDomainAndBasePath ?? ""}
                      </span>
                    </span>
                  }
                  size={small ? "small" : "normal"}
                  variant="outlined"
                  mono={true}
                  onDoubleClick={
                    editable
                      ? () => {
                          setInitialState(inputValue);
                          isEditingEnvironment.setTrue();
                        }
                      : () => undefined
                  }
                />
              </FernDropdown>
            ) : (
              <span
                key="url"
                className="whitespace-nowrap font-mono max-sm:hidden"
              >
                {editable ? (
                  <span
                    className={cn(
                      urlTextStyle,
                      "p-0",
                      small ? "text-xs" : "text-sm",
                      "hover:shadow-lg"
                    )}
                    onDoubleClick={
                      editable
                        ? () => {
                            setInitialState(inputValue);
                            isEditingEnvironment.setTrue();
                          }
                        : () => undefined
                    }
                  >
                    {`${urlProtocol}//${fullyQualifiedDomainAndBasePath}`}
                  </span>
                ) : (
                  <>
                    <span
                      className={cn(
                        protocolTextStyle,
                        small ? "text-xs" : "text-sm"
                      )}
                    >
                      {`${urlProtocol}//`}
                    </span>
                    <span className={urlTextStyle}>
                      {fullyQualifiedDomainAndBasePath}
                    </span>
                  </>
                )}
              </span>
            )}
          </span>
        </>
      )}
    </>
  );
}
