import { camelCase } from "es-toolkit/string";
import { LDFlagSet, useFlags } from "launchdarkly-react-client-sdk";
import { Feature } from "./Feature";

const ldFlagPredicate = <T,>(
  flagKey: string,
  defaultValue: T
): ((flags: LDFlagSet) => T) => {
  return (flags: LDFlagSet) => {
    // Camel case the flag key here to match logic from LaunchDarkly's Gatsby plugin.
    // They use snake-case keys in their UI but camelCase in their React SDK and do this to ease
    // the developer experience; we're doing the same thing to be consistent with them.
    // See https://github.com/launchdarkly/LaunchDarkly-Docs/blob/95cebf9ef4841da96ddfec9dd6e3ed76455025d0/src/flags/flagPredicate.ts#L6
    const camelKey = camelCase(flagKey);
    const flagValue = flags[camelKey];

    if (typeof flagValue === "undefined") {
      return defaultValue;
    }

    return flagValue as T;
  };
};

export const LDFeature: <T>(props: Feature.Props<T>) => React.ReactNode = ({
  flag,
  flagDefaultValue,
  match,
  children,
}) => {
  const flags = useFlags();
  const flagPredicate = ldFlagPredicate(flag, flagDefaultValue);
  const flagValue = flagPredicate(flags);

  // If match is undefined, show content when flag evaluates to true
  const neededValue = typeof match === "undefined" ? true : match;

  if (typeof flagValue !== "undefined" && flagValue === neededValue) {
    return <>{children}</>;
  }

  return null;
};
