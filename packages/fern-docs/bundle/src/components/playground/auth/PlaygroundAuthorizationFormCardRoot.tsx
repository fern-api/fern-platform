"use client";

import React from "react";

import { noop } from "es-toolkit/function";
import { useSetAtom } from "jotai";

import { APIV1Read } from "@fern-api/fdr-sdk";
import { Button, FernCollapse } from "@fern-docs/components";
import { useBooleanState } from "@fern-ui/react-commons";

import {
  useApiKeyInjectionConfig,
  useInjectedApiKey,
} from "@/components/services/useApiKeyInjectionConfig";
import {
  PLAYGROUND_AUTH_STATE_BEARER_TOKEN_ATOM,
  PLAYGROUND_AUTH_STATE_OAUTH_ATOM,
} from "@/state/playground";

import { PlaygroundCardTriggerApiKeyInjected } from "./PlaygroundCardTriggerApiKeyInjected";
import { PlaygroundCardTriggerManual } from "./PlaygroundCardTriggerManual";

const PlaygroundAuthorizationFormCardCtx = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  resetForm: () => void;
  apiKey: string | null;
}>({
  open: false,
  setOpen: noop,
  toggleOpen: noop,
  resetForm: noop,
  apiKey: null,
});

export function PlaygroundAuthorizationFormCardRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  const openState = useBooleanState(false);

  const setBearerAuth = useSetAtom(PLAYGROUND_AUTH_STATE_BEARER_TOKEN_ATOM);
  const setOAuth = useSetAtom(PLAYGROUND_AUTH_STATE_OAUTH_ATOM);
  const apiKey = useInjectedApiKey();
  const handleResetBearerAuth = () => {
    setBearerAuth({ token: apiKey ?? "" });
    setOAuth((prev) => ({ ...prev, userSuppliedAccessToken: "" }));
  };

  return (
    <PlaygroundAuthorizationFormCardCtx.Provider
      value={{
        open: openState.value,
        setOpen: openState.setValue,
        toggleOpen: openState.toggleValue,
        resetForm: handleResetBearerAuth,
        apiKey,
      }}
    >
      <div className="relative">{children}</div>
    </PlaygroundAuthorizationFormCardCtx.Provider>
  );
}

export function usePlaygroundAuthorizationFormCard() {
  return React.useContext(PlaygroundAuthorizationFormCardCtx);
}

export function PlaygroundAuthorizationCardTrigger({
  auth,
  disabled,
}: {
  auth: APIV1Read.ApiAuth;
  disabled: boolean;
}) {
  const { open, toggleOpen, setOpen } = usePlaygroundAuthorizationFormCard();
  const apiKeyInjection = useApiKeyInjectionConfig();
  return apiKeyInjection.enabled ? (
    <PlaygroundCardTriggerApiKeyInjected
      auth={auth}
      config={apiKeyInjection}
      disabled={disabled}
      toggleOpen={toggleOpen}
      onClose={() => setOpen(false)}
    />
  ) : (
    <PlaygroundCardTriggerManual
      auth={auth}
      disabled={disabled}
      isOpen={open}
      toggleOpen={toggleOpen}
    />
  );
}

export function PlaygroundAuthorizationFormCardContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { open } = usePlaygroundAuthorizationFormCard();
  return (
    <FernCollapse open={open}>
      <div className="pt-4">{children}</div>
    </FernCollapse>
  );
}

export function useClosePlaygroundAuthorizationFormCard() {
  const { setOpen } = usePlaygroundAuthorizationFormCard();
  return () => setOpen(false);
}

export function PlaygroundAuthorizationFormCardResetButton() {
  const { apiKey, resetForm } = usePlaygroundAuthorizationFormCard();
  if (apiKey == null) {
    return null;
  }
  return (
    <Button onClick={resetForm} variant="outline">
      Reset token to default
    </Button>
  );
}

export function PlaygroundAuthorizationFormCardCloseButton() {
  const { setOpen } = usePlaygroundAuthorizationFormCard();
  return (
    <Button onClick={() => setOpen(false)} variant="outline">
      Close
    </Button>
  );
}
