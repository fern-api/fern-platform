import { Dispatch, SetStateAction, useEffect } from "react";

import { WritableAtom, atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  RESET,
  atomFamily,
  atomWithStorage,
  useAtomCallback,
} from "jotai/utils";
import { useCallbackOne } from "use-memo-one";

import {
  EndpointContext,
  WebSocketContext,
  createEndpointContext,
  createWebSocketContext,
} from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { useEventCallback } from "@fern-ui/react-commons";

import { fernUserAtom } from "@/state/fern-user";

import { selectHref } from "../hooks/useHref";
import {
  PLAYGROUND_AUTH_STATE_BASIC_AUTH_INITIAL,
  PLAYGROUND_AUTH_STATE_BEARER_TOKEN_INITIAL,
  PLAYGROUND_AUTH_STATE_HEADER_INITIAL,
  PLAYGROUND_AUTH_STATE_OAUTH_INITIAL,
  type PlaygroundAuthState,
  PlaygroundAuthStateBasicAuth,
  PlaygroundAuthStateBearerToken,
  PlaygroundAuthStateHeader,
  PlaygroundAuthStateOAuth,
  PlaygroundAuthStateSchema,
  type PlaygroundEndpointRequestFormState,
  type PlaygroundRequestFormState,
  type PlaygroundWebSocketRequestFormState,
} from "../playground/types";
import {
  getInitialEndpointRequestFormStateWithExample,
  getInitialWebSocketRequestFormState,
} from "../playground/utils";
import { flattenApiSection } from "../playground/utils/flatten-apis";
import { pascalCaseHeaderKeys } from "../playground/utils/header-key-case";
import { useAtomEffect } from "./hooks";
import { HEADER_HEIGHT_ATOM } from "./layout";
import { LOCATION_ATOM } from "./location";
import {
  CURRENT_NODE_ATOM,
  NAVIGATION_NODES_ATOM,
  SIDEBAR_ROOT_NODE_ATOM,
} from "./navigation";
import { atomWithStorageValidation } from "./utils/atomWithStorageValidation";
import { IS_MOBILE_SCREEN_ATOM } from "./viewport";

const PLAYGROUND_IS_OPEN_ATOM = atom(false);
PLAYGROUND_IS_OPEN_ATOM.debugLabel = "PLAYGROUND_IS_OPEN_ATOM";

export const IS_PLAYGROUND_ENABLED_ATOM = atom(true);

export const MAX_PLAYGROUND_HEIGHT_ATOM = atom((get) => {
  const isMobileScreen = get(IS_MOBILE_SCREEN_ATOM);
  const headerHeight = get(HEADER_HEIGHT_ATOM);
  return isMobileScreen ? "100vh" : `calc(100vh - ${headerHeight}px)`;
});
MAX_PLAYGROUND_HEIGHT_ATOM.debugLabel = "MAX_PLAYGROUND_HEIGHT_ATOM";

const PLAYGROUND_HEIGHT_VALUE_ATOM = atom<number>(0);
PLAYGROUND_HEIGHT_VALUE_ATOM.debugLabel = "PLAYGROUND_HEIGHT_VALUE_ATOM";

PLAYGROUND_HEIGHT_VALUE_ATOM.onMount = (set) => {
  if (typeof window === "undefined") {
    return;
  }
  set(window.innerHeight);
};

export const PLAYGROUND_NODE_ID = atom(
  (get) => {
    const playgroundParam = get(LOCATION_ATOM).searchParams?.get("playground");
    if (playgroundParam == null) {
      return get(PREV_PLAYGROUND_NODE_ID);
    }
    const nodes = get(NAVIGATION_NODES_ATOM);
    // return FernNavigation.NodeId(playgroundParam);
    const node = nodes.slugMap.get(FernNavigation.slugjoin(playgroundParam));
    if (node == null || !FernNavigation.isApiLeaf(node)) {
      return get(PREV_PLAYGROUND_NODE_ID);
    }
    return node.id;
  },
  (get, set, update: FernNavigation.NodeId | undefined) => {
    const newLocation = {
      ...get(LOCATION_ATOM),
      searchParams: new URLSearchParams(get(LOCATION_ATOM).searchParams),
    };
    const node =
      update != null ? get(NAVIGATION_NODES_ATOM).get(update) : undefined;
    if (node != null && FernNavigation.isApiLeaf(node)) {
      // set playground open
      set(PLAYGROUND_IS_OPEN_ATOM, true);

      newLocation.searchParams.set("playground", selectHref(get, node.slug));
    } else {
      newLocation.searchParams.delete("playground");
      set(PLAYGROUND_IS_OPEN_ATOM, false);
    }
    set(LOCATION_ATOM, newLocation);
  }
);
PLAYGROUND_NODE_ID.debugLabel = "PLAYGROUND_NODE_ID";

export const PLAYGROUND_NODE = atom((get) => {
  const nodeId = get(PLAYGROUND_NODE_ID);
  if (nodeId == null) {
    return undefined;
  }
  const node = get(NAVIGATION_NODES_ATOM).get(nodeId);
  if (node == null || !FernNavigation.isApiLeaf(node)) {
    return undefined;
  }
  return node;
});
PLAYGROUND_NODE.debugLabel = "PLAYGROUND_NODE";

export const PREV_PLAYGROUND_NODE_ID = atom<FernNavigation.NodeId | undefined>(
  undefined
);
PREV_PLAYGROUND_NODE_ID.debugLabel = "PREV_PLAYGROUND_NODE_ID";

export function usePlaygroundNodeId(): FernNavigation.NodeId | undefined {
  return useAtomValue(PLAYGROUND_NODE_ID);
}

export function useIsPlaygroundOpen(): boolean {
  return useAtomValue(PLAYGROUND_IS_OPEN_ATOM);
}

export function usePlaygroundNode():
  | FernNavigation.NavigationNodeApiLeaf
  | undefined {
  return useAtomValue(PLAYGROUND_NODE);
}

export function useClosePlayground(): () => void {
  const [nodeId, setNodeId] = useAtom(PLAYGROUND_NODE_ID);
  const setPrevNodeId = useSetAtom(PREV_PLAYGROUND_NODE_ID);
  return useEventCallback(() => {
    if (nodeId != null) {
      setPrevNodeId(nodeId);
    }
    setNodeId(undefined);
  });
}

// export function useOpenPlayground(): (nodeId?: FernNavigation.NodeId) => void {
//     const setNodeId = useSetAtom(PLAYGROUND_NODE_ID);
//     const prevNodeId = useAtomValue(PREV_PLAYGROUND_NODE_ID);
//     return useEventCallback((nodeId?: FernNavigation.NodeId) => {
//         // TODO: "" implicitly means open + empty state. This is a hack and we should rethink the UX.
//         setNodeId(nodeId ?? prevNodeId ?? FernNavigation.NodeId(""));
//     });
// }

export function useTogglePlayground(): () => void {
  const isPlaygroundOpen = useIsPlaygroundOpen();
  const openPlayground = useOpenPlayground();
  const closePlayground = useClosePlayground();
  return useEventCallback(() => {
    if (isPlaygroundOpen) {
      closePlayground();
    } else {
      void openPlayground();
    }
  });
}

// this should only be invoked once
export function useInitPlaygroundRouter(): void {
  useAtomEffect(
    useEventCallback((get, set) => {
      const nodeId = get(PLAYGROUND_NODE_ID);
      if (nodeId != null) {
        set(PLAYGROUND_IS_OPEN_ATOM, true);
        set(PREV_PLAYGROUND_NODE_ID, nodeId);
      }
    })
  );
}

export const PLAYGROUND_AUTH_STATE_ATOM =
  atomWithStorageValidation<PlaygroundAuthState>(
    "playground-auth-state",
    {},
    {
      validate: PlaygroundAuthStateSchema,
      isSession: true,
      getOnInit: true,
    }
  );

export const PLAYGROUND_AUTH_STATE_BEARER_TOKEN_ATOM = atom(
  (get) => ({
    token:
      get(PLAYGROUND_AUTH_STATE_ATOM).bearerAuth?.token ??
      get(fernUserAtom)?.playground?.initial_state?.auth?.bearer_token ??
      "",
  }),
  (
    _get,
    set,
    update: SetStateAction<PlaygroundAuthStateBearerToken> | typeof RESET
  ) => {
    set(
      PLAYGROUND_AUTH_STATE_ATOM,
      ({ bearerAuth: prevBearerAuth, ...rest }) => {
        const nextBearerAuth =
          typeof update === "function"
            ? update(
                prevBearerAuth ?? PLAYGROUND_AUTH_STATE_BEARER_TOKEN_INITIAL
              )
            : update;

        if (nextBearerAuth === RESET) {
          return rest;
        }

        return { ...rest, bearerAuth: nextBearerAuth };
      }
    );
  }
);

/**
 * If an injected bearer token is provided, the input bearer token should be resettable if it's not empty.
 */
export const PLAYGROUND_AUTH_STATE_BEARER_TOKEN_IS_RESETTABLE_ATOM = atom(
  (get) => {
    const inputBearerAuth = get(PLAYGROUND_AUTH_STATE_BEARER_TOKEN_ATOM).token;
    const injectedBearerAuth =
      get(fernUserAtom)?.playground?.initial_state?.auth?.bearer_token;
    return injectedBearerAuth != null && inputBearerAuth !== injectedBearerAuth;
  }
);

export const PLAYGROUND_AUTH_STATE_HEADER_ATOM = atom(
  (get) => ({
    headers: pascalCaseHeaderKeys({
      ...(get(PLAYGROUND_AUTH_STATE_ATOM).header?.headers ??
        get(fernUserAtom)?.playground?.initial_state?.headers),
    }),
  }),
  (
    _get,
    set,
    update: SetStateAction<PlaygroundAuthStateHeader> | typeof RESET
  ) => {
    set(PLAYGROUND_AUTH_STATE_ATOM, ({ header: prevHeader, ...rest }) => {
      const nextHeader =
        typeof update === "function"
          ? update(prevHeader ?? PLAYGROUND_AUTH_STATE_HEADER_INITIAL)
          : update;

      if (nextHeader === RESET) {
        return rest;
      }

      return { ...rest, header: nextHeader };
    });
  }
);

export const PLAYGROUND_AUTH_STATE_BASIC_AUTH_ATOM = atom(
  (get) => ({
    username:
      get(PLAYGROUND_AUTH_STATE_ATOM).basicAuth?.username ??
      get(fernUserAtom)?.playground?.initial_state?.auth?.basic?.username,
    password:
      get(PLAYGROUND_AUTH_STATE_ATOM).basicAuth?.password ??
      get(fernUserAtom)?.playground?.initial_state?.auth?.basic?.password,
  }),
  (
    _get,
    set,
    update: SetStateAction<Partial<PlaygroundAuthStateBasicAuth>> | typeof RESET
  ) => {
    set(PLAYGROUND_AUTH_STATE_ATOM, (prev) => {
      if (prev == null) {
        return {};
      }

      const { basicAuth: prevBasicAuth, ...rest } = prev;

      const nextBasicAuth =
        typeof update === "function"
          ? update(prevBasicAuth ?? PLAYGROUND_AUTH_STATE_BASIC_AUTH_INITIAL)
          : update;

      if (nextBasicAuth === RESET) {
        return rest;
      }

      return {
        ...rest,
        basicAuth: {
          username: "",
          password: "",
          ...prevBasicAuth,
          ...nextBasicAuth,
        },
      };
    });
  }
);

export const PLAYGROUND_AUTH_STATE_BASIC_AUTH_USERNAME_ATOM = atom(
  (get) => get(PLAYGROUND_AUTH_STATE_BASIC_AUTH_ATOM).username,
  (_get, set, update: SetStateAction<string> | typeof RESET) => {
    set(
      PLAYGROUND_AUTH_STATE_BASIC_AUTH_ATOM,
      ({ username: prevUsername, ...rest }) => {
        const nextUsername =
          typeof update === "function" ? update(prevUsername ?? "") : update;

        if (nextUsername === RESET) {
          return rest;
        }

        return { ...rest, username: nextUsername };
      }
    );
  }
);

export const PLAYGROUND_AUTH_STATE_BASIC_AUTH_PASSWORD_ATOM = atom(
  (get) => get(PLAYGROUND_AUTH_STATE_BASIC_AUTH_ATOM).password,
  (_get, set, update: SetStateAction<string> | typeof RESET) => {
    set(
      PLAYGROUND_AUTH_STATE_BASIC_AUTH_ATOM,
      ({ password: prevPassword, ...rest }) => {
        const nextPassword =
          typeof update === "function" ? update(prevPassword ?? "") : update;

        if (nextPassword === RESET) {
          return rest;
        }

        return { ...rest, password: nextPassword };
      }
    );
  }
);

export const PLAYGROUND_AUTH_STATE_BASIC_AUTH_USERNAME_IS_RESETTABLE_ATOM =
  atom((get) => {
    const inputBasicAuth = get(PLAYGROUND_AUTH_STATE_BASIC_AUTH_ATOM);
    const injectedBasicAuth =
      get(fernUserAtom)?.playground?.initial_state?.auth?.basic;
    return (
      injectedBasicAuth != null &&
      inputBasicAuth.username !== injectedBasicAuth.username
    );
  });

export const PLAYGROUND_AUTH_STATE_BASIC_AUTH_PASSWORD_IS_RESETTABLE_ATOM =
  atom((get) => {
    const inputBasicAuth = get(PLAYGROUND_AUTH_STATE_BASIC_AUTH_ATOM);
    const injectedBasicAuth =
      get(fernUserAtom)?.playground?.initial_state?.auth?.basic;
    return (
      injectedBasicAuth != null &&
      inputBasicAuth.password !== injectedBasicAuth.password
    );
  });

export const PLAYGROUND_AUTH_STATE_OAUTH_ATOM = atom(
  (get) =>
    get(PLAYGROUND_AUTH_STATE_ATOM).oauth ??
    PLAYGROUND_AUTH_STATE_OAUTH_INITIAL,
  (
    _get,
    set,
    update: SetStateAction<PlaygroundAuthStateOAuth> | typeof RESET
  ) => {
    set(PLAYGROUND_AUTH_STATE_ATOM, ({ oauth: prevOauth, ...rest }) => {
      const nextOauth =
        typeof update === "function"
          ? update(prevOauth ?? PLAYGROUND_AUTH_STATE_OAUTH_INITIAL)
          : update;

      if (nextOauth === RESET) {
        return rest;
      }

      return { ...rest, oauth: nextOauth };
    });
  }
);

const playgroundFormStateFamily = atomFamily(
  (nodeId: FernNavigation.NodeId) => {
    const formStateAtom = atomWithStorage<
      PlaygroundRequestFormState | undefined
    >(nodeId, undefined, undefined, {
      getOnInit: true,
    });
    formStateAtom.debugLabel = `playground-form-state:${nodeId}`;
    return formStateAtom;
  }
);

export const usePlaygroundFormStateAtom = (
  nodeId: FernNavigation.NodeId
): WritableAtom<
  PlaygroundRequestFormState | undefined,
  [SetStateAction<PlaygroundRequestFormState | undefined>],
  void
> => {
  const formStateAtom = playgroundFormStateFamily(nodeId);

  useEffect(() => {
    return () => {
      playgroundFormStateFamily.remove(nodeId);
    };
  }, [formStateAtom, nodeId]);

  return formStateAtom;
};

const API_LEAF_NODES = atom((get) =>
  get(NAVIGATION_NODES_ATOM).getNodesInOrder().filter(FernNavigation.isApiLeaf)
);
export const HAS_API_PLAYGROUND = atom(
  (get) => get(IS_PLAYGROUND_ENABLED_ATOM) && get(API_LEAF_NODES).length > 0
);

export function useOpenPlayground(): (
  node?: FernNavigation.NavigationNodeApiLeaf
) => Promise<void> {
  return useAtomCallback(
    useCallbackOne(
      async (get, set, node?: FernNavigation.NavigationNodeApiLeaf) => {
        const domain = window.location.hostname;

        if (!get(HAS_API_PLAYGROUND)) {
          set(PLAYGROUND_NODE_ID, undefined);
          return;
        }

        if (node == null) {
          const prevNodeId = get(PREV_PLAYGROUND_NODE_ID);
          if (
            prevNodeId != null &&
            get(API_LEAF_NODES).some((n) => n.id === prevNodeId)
          ) {
            set(PLAYGROUND_NODE_ID, prevNodeId);
            return;
          }

          // if no previous node, use the current node (if it's an API leaf)
          const currentNode = get(CURRENT_NODE_ATOM);
          if (currentNode != null && FernNavigation.isApiLeaf(currentNode)) {
            set(PLAYGROUND_NODE_ID, currentNode.id);
            return;
          }

          // get the first API leaf node
          const firstApiLeafNode = get(API_LEAF_NODES)[0];
          if (firstApiLeafNode != null) {
            set(PLAYGROUND_NODE_ID, firstApiLeafNode.id);
          }
          return;
        }

        const formStateAtom = playgroundFormStateFamily(node.id);
        set(PLAYGROUND_NODE_ID, node.id);

        const formState = get(formStateAtom);
        if (formState != null) {
          playgroundFormStateFamily.remove(node.id);
          return;
        }

        const playgroundInitialState =
          get(fernUserAtom)?.playground?.initial_state;

        if (node.type === "endpoint") {
          const context = createEndpointContext(node, undefined);

          if (context == null) {
            // TODO: sentry

            console.error(
              "Could not find endpoint for API playground selection state"
            );
            return;
          }

          set(
            formStateAtom,
            getInitialEndpointRequestFormStateWithExample(
              context,
              // HACKHACK: twelvelabs
              domain.includes("twelvelabs")
                ? undefined
                : context.endpoint.examples?.[0],
              playgroundInitialState
            )
          );
        } else if (node.type === "webSocket") {
          const context = createWebSocketContext(node, undefined);

          if (context == null) {
            // TODO: sentry

            console.error(
              "Could not find websocket for API playground selection state"
            );
            playgroundFormStateFamily.remove(node.id);
            return;
          }

          set(
            formStateAtom,
            getInitialWebSocketRequestFormState(context, playgroundInitialState)
          );
        }
        playgroundFormStateFamily.remove(node.id);
      },
      []
    )
  );
}

export function usePlaygroundEndpointFormState(
  ctx: EndpointContext
): [
  PlaygroundEndpointRequestFormState,
  Dispatch<SetStateAction<PlaygroundEndpointRequestFormState>>,
] {
  const formStateAtom = playgroundFormStateFamily(ctx.node.id);
  const formState = useAtomValue(formStateAtom);
  const user = useAtomValue(fernUserAtom);

  return [
    formState?.type === "endpoint"
      ? formState
      : getInitialEndpointRequestFormStateWithExample(
          ctx,
          ctx.endpoint.examples?.[0],
          user?.playground?.initial_state
        ),
    useAtomCallback(
      useCallbackOne(
        (
          get,
          set,
          update: SetStateAction<PlaygroundEndpointRequestFormState>
        ) => {
          const currentFormState = get(formStateAtom);
          const newFormState =
            typeof update === "function"
              ? update(
                  currentFormState?.type === "endpoint"
                    ? currentFormState
                    : getInitialEndpointRequestFormStateWithExample(
                        ctx,
                        ctx.endpoint.examples?.[0],
                        user?.playground?.initial_state
                      )
                )
              : update;
          set(formStateAtom, newFormState);
        },
        [formStateAtom, ctx, user?.playground?.initial_state]
      )
    ),
  ];
}

export function usePlaygroundWebsocketFormState(
  context: WebSocketContext
): [
  PlaygroundWebSocketRequestFormState,
  Dispatch<SetStateAction<PlaygroundWebSocketRequestFormState>>,
] {
  const formStateAtom = playgroundFormStateFamily(context.node.id);
  const formState = useAtomValue(playgroundFormStateFamily(context.node.id));
  const user = useAtomValue(fernUserAtom);

  return [
    formState?.type === "websocket"
      ? formState
      : getInitialWebSocketRequestFormState(
          context,
          user?.playground?.initial_state
        ),
    useAtomCallback(
      useCallbackOne(
        (
          get,
          set,
          update: SetStateAction<PlaygroundWebSocketRequestFormState>
        ) => {
          const currentFormState = get(formStateAtom);
          const newFormState =
            typeof update === "function"
              ? update(
                  currentFormState?.type === "websocket"
                    ? currentFormState
                    : getInitialWebSocketRequestFormState(
                        context,
                        user?.playground?.initial_state
                      )
                )
              : update;
          set(formStateAtom, newFormState);
        },
        [formStateAtom, context, user?.playground?.initial_state]
      )
    ),
  ];
}

export const PLAYGROUND_REQUEST_TYPE_ATOM = atomWithStorage<
  "curl" | "typescript" | "python"
>("api-playground-atom-alpha", "curl");

export const PLAYGROUND_ENVIRONMENT_ATOM = atom<string | undefined>(undefined);

export const usePlaygroundEnvironment = (): string | undefined => {
  return useAtomValue(PLAYGROUND_ENVIRONMENT_ATOM);
};

export const PLAYGROUND_API_GROUPS_ATOM = atom((get) => {
  return flattenApiSection(get(SIDEBAR_ROOT_NODE_ATOM));
});
