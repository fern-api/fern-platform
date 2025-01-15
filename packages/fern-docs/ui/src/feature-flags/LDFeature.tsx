import { isEqual } from "es-toolkit/predicate";
import { camelCase } from "es-toolkit/string";
import { LDFlagSet, useFlags } from "launchdarkly-react-client-sdk";
import { FeatureProps, WithFeatureFlagsProps } from "./types";

const ldFlagPredicate = <T,>(
  flagKey: string,
  fallbackValue: T,
  match: T
): ((flags: LDFlagSet) => boolean) => {
  return (flags: LDFlagSet) => {
    // Camel case the flag key here to match logic from LaunchDarkly's Gatsby plugin.
    // They use snake-case keys in their UI but camelCase in their React SDK and do this to ease
    // the developer experience; we're doing the same thing to be consistent with them.
    // See https://github.com/launchdarkly/LaunchDarkly-Docs/blob/95cebf9ef4841da96ddfec9dd6e3ed76455025d0/src/flags/flagPredicate.ts#L6
    const camelKey = camelCase(flagKey);
    const flagValue = flags[camelKey] ?? fallbackValue;
    return isEqual(flagValue as T, match);
  };
};

export const LDFeature: React.FC<FeatureProps> = ({
  flag,
  fallbackValue = false,
  match = true,
  children,
}) => {
  const flags = useFlags();
  const flagPredicate = ldFlagPredicate(flag, fallbackValue, match);

  if (flagPredicate(flags)) {
    return children;
  }

  return false;
};

export const LDFeatures: React.FC<WithFeatureFlagsProps> = ({
  featureFlags,
  children,
}) => {
  const flags = useFlags();

  if (!featureFlags?.length) {
    return children;
  }

  const predicates = featureFlags.map((featureFlag) =>
    ldFlagPredicate(
      featureFlag.flag,
      featureFlag.fallbackValue,
      featureFlag.match
    )
  );

  if (predicates.some((predicate) => predicate(flags))) {
    return children;
  }

  return false;
};
