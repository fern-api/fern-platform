"use client";

import React from "react";

import { noop } from "ts-essentials";

import {
  EndpointDefinition,
  ErrorResponse,
} from "@fern-api/fdr-sdk/api-definition";

import { useCurrentAnchor } from "@/hooks/use-anchor";

import { useExampleSelection } from "./useExampleSelection";
import { convertNameToAnchorPart } from "./utils";

export const EndpointContext = React.createContext<
  {
    selectedError: ErrorResponse | undefined;
    setSelectedError: (error: ErrorResponse | undefined) => void;
  } & Omit<ReturnType<typeof useExampleSelection>, "defaultLanguage">
>({
  selectedError: undefined,
  setSelectedError: noop,
  selectedExample: undefined,
  examplesByStatusCode: {},
  examplesByKeyAndStatusCode: {},
  selectedExampleKey: {
    language: "",
    statusCode: undefined,
    responseIndex: 0,
    exampleKey: undefined,
  },
  availableLanguages: [],
  setSelectedExampleKey: noop,
});

export function EndpointContextProvider({
  children,
  endpoint,
}: {
  children: React.ReactNode;
  endpoint: EndpointDefinition;
}) {
  const {
    selectedExample,
    examplesByStatusCode,
    examplesByKeyAndStatusCode,
    selectedExampleKey,
    availableLanguages,
    setSelectedExampleKey,
  } = useExampleSelection(endpoint);

  const setStatusCode = React.useCallback(
    (statusCode: number | string | undefined) => {
      setSelectedExampleKey((prev) => {
        if (prev.statusCode === String(statusCode)) {
          return prev;
        }
        return {
          ...prev,
          statusCode: statusCode != null ? String(statusCode) : undefined,
          responseIndex: 0,
        };
      });
    },
    [setSelectedExampleKey]
  );

  const currentAnchor = useCurrentAnchor();

  React.useEffect(() => {
    const statusCodeOrName =
      maybeGetErrorStatusCodeOrNameFromAnchor(currentAnchor);
    if (statusCodeOrName != null) {
      const error = endpoint.errors?.find((e) =>
        typeof statusCodeOrName === "number"
          ? e.statusCode === statusCodeOrName
          : convertNameToAnchorPart(e.name) === statusCodeOrName
      );
      if (error != null) {
        setStatusCode(error.statusCode);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAnchor]);

  const selectedError = endpoint.errors?.find(
    (e) =>
      e.statusCode ===
      (selectedExample?.exampleCall.responseStatusCode ??
        selectedExampleKey.statusCode)
  );

  const handleSelectError = React.useCallback(
    (error: ErrorResponse | undefined) => {
      setStatusCode(error?.statusCode);
    },
    [setStatusCode]
  );

  const value = React.useMemo(
    () => ({
      selectedError,
      setSelectedError: handleSelectError,
      selectedExample,
      examplesByStatusCode,
      examplesByKeyAndStatusCode,
      selectedExampleKey,
      availableLanguages,
      setSelectedExampleKey,
    }),
    [
      selectedError,
      handleSelectError,
      selectedExample,
      examplesByStatusCode,
      examplesByKeyAndStatusCode,
      selectedExampleKey,
      availableLanguages,
      setSelectedExampleKey,
    ]
  );

  return (
    <EndpointContext.Provider value={value}>
      {children}
    </EndpointContext.Provider>
  );
}

export function useEndpointContext() {
  return React.useContext(EndpointContext);
}

const ERROR_ANCHOR_PREFIX = "response.error.";

function maybeGetErrorStatusCodeOrNameFromAnchor(
  anchor: string | undefined
): number | string | undefined {
  if (anchor?.startsWith(ERROR_ANCHOR_PREFIX)) {
    // error anchor format is response.error.{statusCode}.property.a.b.c
    // get {statusCode} from the anchor
    const statusCodeOrErrorName = anchor.split(".")[2];
    if (statusCodeOrErrorName != null) {
      const statusCode = parseInt(statusCodeOrErrorName, 10);
      if (!isNaN(statusCode)) {
        return statusCode;
      } else {
        return statusCodeOrErrorName;
      }
    }
  }
  return undefined;
}
