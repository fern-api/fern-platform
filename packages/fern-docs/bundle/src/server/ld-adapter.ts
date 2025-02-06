import { FernNavigation } from "@fern-api/fdr-sdk";
import { getLaunchDarklySettings } from "@fern-docs/edge-config";
import * as ld from "@launchdarkly/node-server-sdk";
import { isEqual } from "es-toolkit/predicate";
import { camelCase } from "es-toolkit/string";
import { AuthState } from "./auth/getAuthState";
import { getOrgMetadataForDomain } from "./auth/metadata-for-url";

async function withLaunchDarklyContext(
  endpoint: string | undefined,
  authState: AuthState,
  node: FernNavigation.utils.Node,
  rawCookie: string | undefined
): Promise<ld.LDContext> {
  if (endpoint == null) {
    return { kind: "user", key: "anonymous", anonymous: true };
  }
  try {
    const url = new URL(endpoint);
    url.searchParams.set("anonymous", String(!authState.authed));
    if (node.type === "found") {
      if (node.currentVersion) {
        url.searchParams.set("version", node.currentVersion.versionId);
      }
    }

    const headers = new Headers();

    // TODO: this forwards the cookie to an adapter that should generate a LaunchDarkly context
    // if we migrate from edge config to docs.yml, we need to maintain an strict allowlist
    if (rawCookie != null) {
      headers.set("Cookie", rawCookie);
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch LaunchDarkly context: ${response.statusText}`
      );
    }
    const context = await response.json();

    return context;
  } catch (error) {
    console.error(error);
    return { kind: "user", key: "anonymous", anonymous: true };
  }
}

interface LaunchDarklyInfo {
  clientSideId: string;
  contextEndpoint: string | undefined;
  context: ld.LDContext | undefined;
  defaultFlags: object | undefined;
  options:
    | {
        baseUrl: string | undefined;
        streamUrl: string | undefined;
        eventsUrl: string | undefined;
        hash: string | undefined;
      }
    | undefined;
}

export async function withLaunchDarkly(
  domain: string,
  authState: AuthState,
  node: FernNavigation.utils.Node,
  rawCookie?: string
): Promise<
  [
    LaunchDarklyInfo | undefined,
    (node: FernNavigation.WithFeatureFlags) => boolean,
  ]
> {
  const launchDarklyConfig = await getLaunchDarklySettings(
    domain,
    getOrgMetadataForDomain(domain).then((metadata) => metadata?.orgId)
  );
  if (launchDarklyConfig) {
    const context = await withLaunchDarklyContext(
      launchDarklyConfig["context-endpoint"],
      authState,
      node,
      rawCookie
    );
    const options = {
      baseUrl: launchDarklyConfig.options?.["base-url"],
      streamUrl: launchDarklyConfig.options?.["stream-url"],
      eventsUrl: launchDarklyConfig.options?.["events-url"],
    };
    const { flags, json, hash } = launchDarklyConfig["sdk-key"]
      ? await fetchInitialFlags(launchDarklyConfig["sdk-key"], context, options)
      : { flags: undefined, json: undefined, hash: undefined };
    return [
      {
        clientSideId: launchDarklyConfig["client-side-id"],
        contextEndpoint: launchDarklyConfig["context-endpoint"],
        context,
        defaultFlags: json,
        options: { ...options, hash },
      },
      // Note: if sdk-key is set, then middleware will automatically switch to 100% getServerSideProps
      // because getServerSideProps must determine whether any given page should be rendered or not.
      launchDarklyConfig["sdk-key"]
        ? await createLdPredicate({ flags })
        : createDefaultFeatureFlagPredicate(),
    ];
  }
  return [undefined, createDefaultFeatureFlagPredicate()];
}

function createDefaultFeatureFlagPredicate(): (
  node: FernNavigation.WithFeatureFlags
) => boolean {
  return (node) =>
    node.featureFlags == null ||
    node.featureFlags.length === 0 ||
    node.featureFlags.some((flag) => {
      const fallbackValue = flag.fallbackValue ?? false;
      const match = flag.match ?? true;
      return isEqual(fallbackValue, match);
    });
}

export const createLdPredicate = async ({
  flags = {},
}: {
  flags?: Record<string, unknown>;
}): Promise<(node: FernNavigation.WithFeatureFlags) => boolean> => {
  return (node) => {
    if (node.featureFlags == null || node.featureFlags.length === 0) {
      return true;
    }
    return node.featureFlags.some((flag) => {
      const key = camelCase(flag.flag);
      const flagValue = flags[key] ?? flag.fallbackValue ?? false;
      const match = flag.match ?? true;
      return isEqual(flagValue, match);
    });
  };
};

async function fetchInitialFlags(
  sdkKey: string,
  context: ld.LDContext,
  options?: {
    baseUrl?: string;
    streamUrl?: string;
    eventsUrl?: string;
  }
): Promise<{
  flags: Record<string, unknown> | undefined;
  json: object | undefined;
  hash: string | undefined;
}> {
  try {
    const ldClient = ld.init(sdkKey, {
      baseUri: options?.baseUrl,
      streamUri: options?.streamUrl,
      eventsUri: options?.eventsUrl,
      stream: false,
      sendEvents: false,
      diagnosticOptOut: true,
    });

    await ldClient.waitForInitialization({ timeout: 10 });

    const flags = await ldClient.allFlagsState(context, {
      clientSideOnly: true, // these flags will be passed to the client side
      detailsOnlyForTrackedFlags: true,
    });

    return {
      flags: flags.allValues(),
      json: flags.toJSON(),
      hash: ldClient.secureModeHash(context),
    };
  } catch (error) {
    console.error(error);
    return {
      flags: undefined,
      json: undefined,
      hash: undefined,
    };
  }
}
