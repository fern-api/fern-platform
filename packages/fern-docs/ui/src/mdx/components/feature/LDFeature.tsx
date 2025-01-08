import { camelCase } from "es-toolkit/string";
import { LDFlagSet, useFlags } from "launchdarkly-react-client-sdk";
import { Feature } from "./Feature";

const ldFlagPredicate = <T,>(
  flagKey: string,
  defaultValue: T
): ((flags: LDFlagSet) => T) => {
  return (flags: LDFlagSet) => {
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
